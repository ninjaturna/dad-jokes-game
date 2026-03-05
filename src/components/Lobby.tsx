import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../lib/supabase'
import { identityMatchesRoom, clearIdentity } from '../lib/device'
import { shuffle } from '../lib/gameLogic'
import { JOKES } from './jokes'
import type { Room, Player, OfficiationMode } from '../types/game'

export default function Lobby() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const joinUrl = `${window.location.origin}/games/canyoukeepastraightface/join/${code}`

  // Load room + players
  const loadRoom = useCallback(async () => {
    if (!code) return

    const identity = identityMatchesRoom(code)
    if (!identity) {
      navigate(`/join/${code}`, { replace: true })
      return
    }

    const { data: roomData } = await supabase
      .from('rooms')
      .select('*')
      .eq('join_code', code.toUpperCase())
      .single()

    if (!roomData) {
      navigate('/', { replace: true })
      return
    }

    if (roomData.status === 'playing') {
      navigate(`/room/${code}`, { replace: true })
      return
    }

    setRoom(roomData as Room)

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .order('joined_at')

    const playerList = (playersData ?? []) as Player[]
    setPlayers(playerList)
    setMyPlayer(playerList.find((p) => p.id === identity.player_id) ?? null)
  }, [code, navigate])

  useEffect(() => {
    loadRoom()
  }, [loadRoom])

  // Realtime: listen for player_joined events + room status changes
  useEffect(() => {
    if (!room) return

    const channel = supabase
      .channel(`lobby:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_events',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          const evt = payload.new as { event_type: string }
          if (evt.event_type === 'player_joined') {
            loadRoom()
          }
          if (evt.event_type === 'game_started') {
            navigate(`/room/${code}`, { replace: true })
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updated = payload.new as Room
          setRoom(updated)
          if (updated.status === 'playing') {
            navigate(`/room/${code}`, { replace: true })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room, code, navigate, loadRoom])

  async function toggleTeam(playerId: string) {
    const player = players.find((p) => p.id === playerId)
    if (!player) return
    const newTeam = player.team === 0 ? 1 : 0
    await supabase.from('players').update({ team: newTeam }).eq('id', playerId)
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, team: newTeam } : p)),
    )
  }

  async function removePlayer(playerId: string) {
    await supabase.from('players').delete().eq('id', playerId)
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  async function setOfficiation(mode: OfficiationMode) {
    if (!room || !myPlayer) return
    // Update room's officiation mode
    await supabase.from('rooms').update({ officiation_mode: mode }).eq('id', room.id)
    setRoom((prev) => prev ? { ...prev, officiation_mode: mode } : prev)

    // Toggle host creator's role: 'host' if dedicated ref, 'player' if self-officiated
    const newRole = mode === 'dedicated_host' ? 'host' : 'player'
    const newTeam = mode === 'dedicated_host' ? null : (room.mode === 'teams' ? 0 : null)
    await supabase.from('players').update({ role: newRole, team: newTeam }).eq('id', myPlayer.id)
    setMyPlayer((prev) => prev ? { ...prev, role: newRole, team: newTeam } : prev)
    setPlayers((prev) => prev.map((p) => p.id === myPlayer.id ? { ...p, role: newRole, team: newTeam } : p))
  }

  function canStart(): boolean {
    if (!room) return false
    const activePlayers = players.filter((p) => p.role !== 'host')
    if (room.officiation_mode === 'dedicated_host') {
      const refs = players.filter((p) => p.role === 'host')
      if (refs.length !== 1) return false
      if (activePlayers.length < 2) return false
    } else {
      if (activePlayers.length < 2) return false
    }
    if (room.mode === 'teams') {
      const t0 = activePlayers.filter((p) => p.team === 0)
      const t1 = activePlayers.filter((p) => p.team === 1)
      return t0.length > 0 && t1.length > 0
    }
    return true
  }

  async function startGame() {
    if (!room || !canStart()) return
    setStarting(true)
    setError('')

    try {
      // Build a shuffled deck of indices (0-based into the JOKES array in game component)

      // In practice we filter by category if set
      let jokeIds: number[] = []

      if (room.active_category) {
        const { data: jokes } = await supabase
          .from('jokes')
          .select('id')
          .eq('category', room.active_category)
          .eq('is_active', true)
        jokeIds = (jokes ?? []).map((j: { id: number }) => j.id)
      }

      // If no DB jokes yet (table empty), fall back to client-side index shuffle
      const deckOrder =
        jokeIds.length > 0
          ? shuffle(jokeIds)
          : shuffle(Array.from({ length: JOKES.length }, (_, i) => i))

      const alive = players.map((p) => ({ ...p, is_alive: true }))
      // Exclude dedicated ref from joke-telling rotation
      const participants = alive.filter((p) => p.role !== 'host')
      const teller =
        room.mode === '1v1'
          ? participants[0]
          : participants.find((p) => p.team === 0) ?? participants[0]
      const listener =
        room.mode === '1v1'
          ? participants[1]
          : participants.find((p) => p.team === 1) ?? participants[1]

      // Update room to playing
      await supabase.from('rooms').update({
        status: 'playing',
        deck_order: deckOrder,
        deck_index: 0,
        round_number: 1,
        current_teller_id: teller.id,
        current_listener_id: listener.id,
      }).eq('id', room.id)

      // Reset all players to alive
      await supabase
        .from('players')
        .update({ is_alive: true })
        .eq('room_id', room.id)

      // Fire game_started event
      await supabase.from('game_events').insert({
        room_id: room.id,
        event_type: 'game_started',
        payload: {
          mode: room.mode,
          deck_order: deckOrder,
          teller_id: teller.id,
          listener_id: listener.id,
        },
      })

      navigate(`/room/${code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start')
      setStarting(false)
    }
  }

  function leaveRoom() {
    clearIdentity()
    navigate('/')
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading room…</p>
      </div>
    )
  }

  const isHost = myPlayer?.is_host ?? false
  const team0 = players.filter((p) => p.team === 0)
  const team1 = players.filter((p) => p.team === 1)
  const nonTeamed = players.filter((p) => p.team === null)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-6 gap-6">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-gray-500 text-xs uppercase tracking-widest">Room Code</p>
          <h1 className="text-6xl font-black tracking-widest">{code}</h1>
          <p className="text-gray-400 text-sm">
            {room.mode === '1v1' ? '1 v 1 Mode' : 'Teams Mode'}
            {room.active_category && ` · ${room.active_category}`}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white p-3 rounded-2xl">
            <QRCodeSVG value={joinUrl} size={160} />
          </div>
          <p className="text-gray-500 text-xs text-center break-all">{joinUrl}</p>
        </div>

        {/* Officiation toggle — host only */}
        {isHost && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Who's running the game?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOfficiation('self_officiated')}
                className={`py-3 px-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors ${
                  room.officiation_mode !== 'dedicated_host'
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                👥 We're all in
              </button>
              <button
                onClick={() => setOfficiation('dedicated_host')}
                className={`py-3 px-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-colors ${
                  room.officiation_mode === 'dedicated_host'
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                🎙️ I'm the ref
              </button>
            </div>
            <p className="text-gray-600 text-xs">
              {room.officiation_mode === 'dedicated_host'
                ? "You're the ref — you call laughs. You won't be dealt jokes."
                : 'Everyone self-officiates — each player calls the other\'s laugh.'}
            </p>
          </div>
        )}

        {/* Player list */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Players ({players.length})
          </p>

          {room.mode === 'teams' ? (
            <div className="space-y-3">
              {/* Team 0 */}
              <div className="space-y-1">
                <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">
                  🔥 {room.team_0_name}
                </p>
                {team0.map((p) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    isHost={isHost}
                    myId={myPlayer?.id}
                    mode="teams"
                    onToggleTeam={toggleTeam}
                    onRemove={removePlayer}
                  />
                ))}
              </div>
              {/* Team 1 */}
              <div className="space-y-1">
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                  🧊 {room.team_1_name}
                </p>
                {team1.map((p) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    isHost={isHost}
                    myId={myPlayer?.id}
                    mode="teams"
                    onToggleTeam={toggleTeam}
                    onRemove={removePlayer}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {(nonTeamed.length > 0 ? nonTeamed : players).map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  isHost={isHost}
                  myId={myPlayer?.id}
                  mode="1v1"
                  onToggleTeam={toggleTeam}
                  onRemove={removePlayer}
                />
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Start / waiting */}
        {isHost ? (
          <button
            onClick={startGame}
            disabled={!canStart() || starting}
            className="w-full py-4 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest disabled:opacity-30 active:scale-95 transition-transform"
          >
            {starting ? 'Starting…' : 'Start Game'}
          </button>
        ) : (
          <div className="text-center py-4 border border-gray-800 rounded-2xl">
            <p className="text-gray-400 text-sm">Waiting for host to start…</p>
          </div>
        )}

        {!canStart() && players.length < 2 && (
          <p className="text-gray-600 text-xs text-center">
            Need at least 2 players to start
          </p>
        )}

        <button
          onClick={leaveRoom}
          className="w-full text-gray-600 text-sm py-2 underline underline-offset-2"
        >
          Leave room
        </button>
      </div>
    </div>
  )
}

interface PlayerRowProps {
  player: Player
  isHost: boolean
  myId: string | undefined
  mode: '1v1' | 'teams'
  onToggleTeam: (id: string) => void
  onRemove: (id: string) => void
}

function PlayerRow({ player, isHost, myId, mode, onToggleTeam, onRemove }: PlayerRowProps) {
  const isRef = player.role === 'host'
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isRef ? 'bg-yellow-950 border border-yellow-800' : 'bg-gray-900'}`}>
      <span className="flex-1 font-semibold text-sm truncate">
        {player.name}
        {isRef && (
          <span className="ml-2 text-xs text-yellow-400 font-bold">🎙️ REF</span>
        )}
        {player.is_host && !isRef && (
          <span className="ml-2 text-xs text-yellow-400 font-bold">HOST</span>
        )}
        {player.id === myId && (
          <span className="ml-2 text-xs text-gray-500">(you)</span>
        )}
      </span>

      {isHost && mode === 'teams' && !isRef && (
        <button
          onClick={() => onToggleTeam(player.id)}
          className="text-xs px-2 py-1 rounded-lg border border-gray-700 text-gray-400 hover:border-white hover:text-white transition-colors"
        >
          {player.team === 0 ? '🔥' : '🧊'} swap
        </button>
      )}

      {isHost && player.id !== myId && (
        <button
          onClick={() => onRemove(player.id)}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors px-1"
          title="Remove player"
        >
          ✕
        </button>
      )}
    </div>
  )
}
