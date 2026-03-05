import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { identityMatchesRoom, clearIdentity } from '../lib/device'
import { checkGameOver, nextTurnPair, nextPairAfterElimination } from '../lib/gameLogic'
import { playSound, preloadSounds } from '../lib/sounds'
import Scoreboard from './Scoreboard'
import type { Room, Player, Round, GameEvent } from '../types/game'

import { JOKES } from './jokes'

type GameScreen = 'game' | 'scoreboard' | 'eliminated' | 'winner'

export default function GameRoom() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [rounds, setRounds] = useState<Round[]>([])
  const [myPlayer, setMyPlayer] = useState<Player | null>(null)
  const [screen, setScreen] = useState<GameScreen>('game')
  const [flipped, setFlipped] = useState(false)
  const [winner, setWinner] = useState<{ name: string; type: 'player' | 'team' } | null>(null)
  const [lastEliminated, setLastEliminated] = useState<Player | null>(null)
  const [processing, setProcessing] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadState = useCallback(async () => {
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

    if (!roomData) { navigate('/', { replace: true }); return }
    if (roomData.status === 'lobby') { navigate(`/lobby/${code}`, { replace: true }); return }

    setRoom(roomData as Room)

    const { data: playersData } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .order('joined_at')

    const playerList = (playersData ?? []) as Player[]
    setPlayers(playerList)
    setMyPlayer(playerList.find((p) => p.id === identity.player_id) ?? null)

    const { data: roundsData } = await supabase
      .from('rounds')
      .select('*')
      .eq('room_id', roomData.id)
      .order('created_at')

    setRounds((roundsData ?? []) as Round[])

    if (roomData.status === 'finished') {
      setScreen('winner')
    }
  }, [code, navigate])

  useEffect(() => {
    loadState()
    preloadSounds()
  }, [loadState])

  // Realtime subscription
  useEffect(() => {
    if (!room) return

    const channel = supabase
      .channel(`game:${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_events',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => handleGameEvent(payload.new as GameEvent),
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
          setRoom(payload.new as Room)
          setFlipped(false)
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${room.id}`,
        },
        () => { loadState() },
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id])

  function handleGameEvent(evt: GameEvent) {
    switch (evt.event_type) {
      case 'joke_revealed':
        setFlipped(true)
        playSound('rimshot')
        break
      case 'laughed':
      case 'laughed_self_report':
        playSound('elimination')
        loadState()
        break
      case 'player_eliminated':
        setLastEliminated(
          players.find((p) => p.id === (evt.payload.player_id as string)) ?? null,
        )
        setScreen('eliminated')
        break
      case 'game_over':
        playSound('winner_fanfare')
        setWinner({
          name: evt.payload.winner_name as string,
          type: evt.payload.winner_type as 'player' | 'team',
        })
        setScreen('winner')
        break
      case 'turn_passed':
        setScreen('scoreboard')
        setFlipped(false)
        loadState()
        break
      case 'sound_trigger':
        playSound(evt.payload.sound as Parameters<typeof playSound>[0])
        break
      case 'rematch':
        setScreen('game')
        setFlipped(false)
        setWinner(null)
        setLastEliminated(null)
        loadState()
        break
    }
  }

  // ── Shared game actions ───────────────────────────────────────────────────

  async function revealJoke() {
    if (!room || flipped) return
    setFlipped(true)
    await supabase.from('game_events').insert({
      room_id: room.id,
      event_type: 'joke_revealed',
      payload: {
        joke_index: room.deck_order[room.deck_index],
        deck_index: room.deck_index,
      },
    })
  }

  // Core elimination logic — shared by dedicated ref and self-officiated modes
  async function processLaugh() {
    if (!room || !myPlayer) return

    const listener = players.find((p) => p.id === room.current_listener_id)
    const teller = players.find((p) => p.id === room.current_teller_id)
    if (!listener || !teller) return

    await supabase
      .from('players')
      .update({ is_alive: false, times_eliminated: listener.times_eliminated + 1 })
      .eq('id', listener.id)

    await supabase
      .from('players')
      .update({ jokes_survived: teller.jokes_survived + 1 })
      .eq('id', teller.id)

    await supabase.from('rounds').insert({
      room_id: room.id,
      round_number: room.round_number,
      teller_id: teller.id,
      listener_id: listener.id,
      joke_index: room.deck_order[room.deck_index],
      laughed: true,
      completed_at: new Date().toISOString(),
    })

    const updatedPlayers = players.map((p) =>
      p.id === listener.id ? { ...p, is_alive: false } : p,
    )

    const gameOver = checkGameOver(updatedPlayers, room.mode)
    const eventType = room.officiation_mode === 'self_officiated' ? 'laughed_self_report' : 'laughed'

    if (gameOver) {
      let winnerName = ''
      if (gameOver.type === 'player' && gameOver.winnerId) {
        winnerName = updatedPlayers.find((p) => p.id === gameOver.winnerId)?.name ?? ''
        await supabase.from('players').update({ wins: (teller.wins ?? 0) + 1 }).eq('id', teller.id)
      } else if (gameOver.type === 'team' && gameOver.teamIdx !== undefined) {
        winnerName = gameOver.teamIdx === 0 ? room.team_0_name : room.team_1_name
      }

      await supabase.from('rooms').update({ status: 'finished' }).eq('id', room.id)

      await supabase.from('game_events').insert([
        {
          room_id: room.id,
          event_type: eventType,
          payload: { listener_id: listener.id, teller_id: teller.id, round_number: room.round_number },
          triggered_by: myPlayer.id,
        },
        {
          room_id: room.id,
          event_type: 'game_over',
          payload: {
            winner_type: gameOver.type,
            winner_id: gameOver.winnerId ?? null,
            winner_team: gameOver.teamIdx ?? null,
            winner_name: winnerName,
          },
        },
      ])
    } else {
      const nextPair = nextPairAfterElimination(updatedPlayers, teller.id, room.mode)

      await supabase.from('rooms').update({
        current_teller_id: nextPair?.teller.id ?? teller.id,
        current_listener_id: nextPair?.listener.id ?? listener.id,
        deck_index: room.deck_index + 1,
        round_number: room.round_number + 1,
      }).eq('id', room.id)

      await supabase.from('game_events').insert([
        {
          room_id: room.id,
          event_type: eventType,
          payload: { listener_id: listener.id, teller_id: teller.id, round_number: room.round_number },
          triggered_by: myPlayer.id,
        },
        {
          room_id: room.id,
          event_type: 'player_eliminated',
          payload: {
            player_id: listener.id,
            name: listener.name,
            team: listener.team,
          },
        },
      ])
    }
  }

  async function handleLaughed() {
    if (!room || !myPlayer || processing || !flipped) return
    // Dedicated ref OR teller calling it in self_officiated
    const canCall =
      (room.officiation_mode === 'dedicated_host' && myPlayer.role === 'host') ||
      (room.officiation_mode === 'self_officiated' && myPlayer.id === room.current_teller_id)
    if (!canCall) return
    setProcessing(true)
    try { await processLaugh() } finally { setProcessing(false) }
  }

  // Listener self-reports in self_officiated mode
  async function handleLaughReport() {
    if (!room || !myPlayer || processing || !flipped) return
    if (room.officiation_mode !== 'self_officiated') return
    if (myPlayer.id !== room.current_listener_id) return
    setProcessing(true)
    try { await processLaugh() } finally { setProcessing(false) }
  }

  async function handleNoLaugh() {
    if (!room || !myPlayer || processing || !flipped) return
    const canCall =
      (room.officiation_mode === 'dedicated_host' && myPlayer.role === 'host') ||
      (room.officiation_mode === 'self_officiated' && myPlayer.id === room.current_teller_id)
    if (!canCall) return
    setProcessing(true)

    try {
      const teller = players.find((p) => p.id === room.current_teller_id)
      const listener = players.find((p) => p.id === room.current_listener_id)
      if (!teller || !listener) return

      await supabase.from('rounds').insert({
        room_id: room.id,
        round_number: room.round_number,
        teller_id: teller.id,
        listener_id: listener.id,
        joke_index: room.deck_order[room.deck_index],
        laughed: false,
        completed_at: new Date().toISOString(),
      })

      const nextPair = nextTurnPair(players, teller.id, listener.id, room.mode)

      await supabase.from('rooms').update({
        current_teller_id: nextPair?.teller.id ?? listener.id,
        current_listener_id: nextPair?.listener.id ?? teller.id,
        deck_index: room.deck_index + 1,
        round_number: room.round_number + 1,
      }).eq('id', room.id)

      await supabase.from('game_events').insert({
        room_id: room.id,
        event_type: 'turn_passed',
        payload: { teller_id: teller.id, listener_id: listener.id, round_number: room.round_number },
        triggered_by: myPlayer.id,
      })
    } finally {
      setProcessing(false)
    }
  }

  async function handleRematch() {
    if (!room || !myPlayer?.is_host) return

    const freshDeck = [...room.deck_order]
    const rotated = [...freshDeck.slice(room.deck_index), ...freshDeck.slice(0, room.deck_index)]

    const freshPlayers = players
      .map((p) => ({ ...p, is_alive: true }))
      .filter((p) => p.role !== 'host')
    const teller = room.mode === '1v1' ? freshPlayers[0] : freshPlayers.find((p) => p.team === 0) ?? freshPlayers[0]
    const listener = room.mode === '1v1' ? freshPlayers[1] : freshPlayers.find((p) => p.team === 1) ?? freshPlayers[1]

    await supabase.from('players').update({ is_alive: true }).eq('room_id', room.id)

    await supabase.from('rooms').update({
      status: 'playing',
      deck_order: rotated,
      deck_index: 0,
      round_number: 1,
      current_teller_id: teller.id,
      current_listener_id: listener.id,
    }).eq('id', room.id)

    await supabase.from('game_events').insert({
      room_id: room.id,
      event_type: 'rematch',
      payload: { teller_id: teller.id, listener_id: listener.id },
    })
  }

  function leaveGame() {
    clearIdentity()
    navigate('/')
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  if (!room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Loading game…</p>
      </div>
    )
  }

  const teller = players.find((p) => p.id === room.current_teller_id)
  const listener = players.find((p) => p.id === room.current_listener_id)
  const rawIdx = Number(room.deck_order?.[room.deck_index] ?? 0)
  const jokeIdx = Number.isFinite(rawIdx) ? Math.min(rawIdx, JOKES.length - 1) : 0
  const joke = JOKES[jokeIdx]

  const isHost = myPlayer?.is_host ?? false
  const isRef = myPlayer?.role === 'host' && room.officiation_mode === 'dedicated_host'
  const isTeller = myPlayer?.id === room.current_teller_id
  const isListener = myPlayer?.id === room.current_listener_id

  // ── WINNER SCREEN ────────────────────────────────────────────────────────
  if (screen === 'winner' && winner) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 gap-8">
        <Confetti />
        <div className="text-center space-y-3 z-10">
          <p className="text-gray-400 text-sm uppercase tracking-widest">Winner</p>
          <h1 className="text-5xl font-black">{winner.name}</h1>
          <p className="text-gray-400">
            {winner.type === 'team' ? 'wins the game!' : 'survives!'}
          </p>
        </div>
        <div className="w-full max-w-sm z-10">
          <Scoreboard room={room} players={players} rounds={rounds} label="Final Score" />
        </div>
        {isHost && (
          <div className="flex flex-col gap-3 w-full max-w-sm z-10">
            <button
              onClick={handleRematch}
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest active:scale-95 transition-transform"
            >
              Rematch
            </button>
            <button
              onClick={leaveGame}
              className="w-full py-3 rounded-2xl border border-gray-700 text-gray-400 text-sm"
            >
              New Game
            </button>
          </div>
        )}
        {!isHost && (
          <p className="text-gray-500 text-sm z-10">Waiting for host to start a rematch…</p>
        )}
      </div>
    )
  }

  // ── SCOREBOARD (between turns) ───────────────────────────────────────────
  if (screen === 'scoreboard') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-black text-center">ROUND {room.round_number - 1} OVER</h2>
          <Scoreboard
            room={room}
            players={players}
            rounds={rounds}
            label="Standings"
            showContinue={isHost}
            onContinue={() => setScreen('game')}
          />
          {!isHost && (
            <p className="text-gray-500 text-sm text-center">Waiting for host…</p>
          )}
        </div>
      </div>
    )
  }

  // ── ELIMINATED SCREEN ────────────────────────────────────────────────────
  if (screen === 'eliminated') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-center space-y-2">
          <p className="text-6xl">💀</p>
          <h2 className="text-3xl font-black">
            {lastEliminated?.name ?? 'Someone'} LAUGHED!
          </h2>
          <p className="text-gray-400">They're out</p>
        </div>
        {room.mode === 'teams' && (
          <div className="flex gap-6 text-center">
            {([0, 1] as const).map((t) => {
              const alive = players.filter((p) => p.team === t && p.is_alive).length
              return (
                <div key={t}>
                  <p className="text-2xl font-black">{alive}</p>
                  <p className="text-xs text-gray-400 uppercase">
                    {t === 0 ? room.team_0_name : room.team_1_name}
                  </p>
                </div>
              )
            })}
          </div>
        )}
        <div className="w-full max-w-sm">
          <Scoreboard room={room} players={players} rounds={rounds} />
        </div>
        {isHost && (
          <button
            onClick={() => setScreen('game')}
            className="w-full max-w-sm py-4 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest active:scale-95 transition-transform"
          >
            Next Round
          </button>
        )}
        {!isHost && (
          <p className="text-gray-500 text-sm">Waiting for host…</p>
        )}
      </div>
    )
  }

  // ── GAME SCREEN ──────────────────────────────────────────────────────────

  if (isRef) {
    return (
      <RefPanelView
        room={room}
        players={players}
        rounds={rounds}
        teller={teller}
        listener={listener}
        flipped={flipped}
        processing={processing}
        onReveal={revealJoke}
        onLaughed={handleLaughed}
        onNoLaugh={handleNoLaugh}
      />
    )
  }

  if (isTeller) {
    return (
      <TellerView
        teller={teller}
        listener={listener}
        joke={joke}
        flipped={flipped}
        room={room}
        processing={processing}
        onReveal={revealJoke}
        onLaughed={handleLaughed}
        onNoLaugh={handleNoLaugh}
      />
    )
  }

  if (isListener) {
    return (
      <ListenerView
        listener={listener}
        teller={teller}
        flipped={flipped}
        room={room}
        processing={processing}
        onLaughReport={handleLaughReport}
      />
    )
  }

  // Spectator / eliminated player
  return (
    <SpectatorView
      room={room}
      players={players}
      rounds={rounds}
      teller={teller}
      listener={listener}
      joke={joke}
      flipped={flipped}
    />
  )
}

// ── Per-device view components ───────────────────────────────────────────────

interface JokeData { q: string; a: string }

function TellerView({
  teller: _teller, listener, joke, flipped, room, processing, onReveal, onLaughed, onNoLaugh,
}: {
  teller: Player | undefined
  listener: Player | undefined
  joke: JokeData
  flipped: boolean
  room: Room
  processing: boolean
  onReveal: () => void
  onLaughed: () => void
  onNoLaugh: () => void
}) {
  const isSelfOfficiated = room.officiation_mode === 'self_officiated'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 gap-6">
      <div className="w-full max-w-sm space-y-2 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-green-400">You're telling</p>
        <p className="text-gray-400 text-sm">
          Make <span className="text-white font-bold">{listener?.name ?? '…'}</span> laugh
        </p>
      </div>

      {/* Joke card */}
      <div className="w-full max-w-sm bg-gray-900 rounded-3xl p-6 space-y-4 border border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest">Round {room.round_number}</p>
        <p className="text-xl font-bold leading-snug">{joke.q}</p>
        {flipped ? (
          <div className="border-t border-gray-700 pt-4">
            <p className="text-yellow-400 text-xl font-black">{joke.a}</p>
          </div>
        ) : (
          isSelfOfficiated ? (
            <button
              onClick={onReveal}
              className="w-full py-3 rounded-xl bg-yellow-400 text-black font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
            >
              Reveal Punchline 🥁
            </button>
          ) : (
            <p className="text-gray-600 text-sm italic">Waiting for ref to reveal punchline…</p>
          )
        )}
      </div>

      {/* Self-officiated controls — shown after reveal */}
      {isSelfOfficiated && flipped && (
        <div className="w-full max-w-sm grid grid-cols-2 gap-3">
          <button
            onClick={onLaughed}
            disabled={processing}
            className="py-5 rounded-2xl bg-red-500 text-white font-black text-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
          >
            😂 LAUGHED
          </button>
          <button
            onClick={onNoLaugh}
            disabled={processing}
            className="py-5 rounded-2xl bg-green-600 text-white font-black text-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
          >
            😐 HELD IT
          </button>
        </div>
      )}

      {!isSelfOfficiated && (
        <p className="text-gray-600 text-xs text-center">The ref controls the game</p>
      )}
    </div>
  )
}

function ListenerView({
  listener: _listener, teller, flipped, room, processing, onLaughReport,
}: {
  listener: Player | undefined
  teller: Player | undefined
  flipped: boolean
  room: Room
  processing: boolean
  onLaughReport: () => void
}) {
  const isSelfOfficiated = room.officiation_mode === 'self_officiated'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 gap-8">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">You're listening</p>
          <p className="text-gray-400 text-sm">
            <span className="text-white font-bold">{teller?.name ?? '…'}</span> is about to hit you with a joke
          </p>
        </div>

        <div className="text-8xl font-black tracking-tighter leading-none select-none">
          {flipped ? (
            <span className="text-red-500 animate-pulse">DON'T<br />LAUGH!</span>
          ) : (
            <span className="text-white">KEEP<br />STRAIGHT<br />FACE</span>
          )}
        </div>

        {!flipped && (
          <p className="text-gray-600 text-sm">Punchline incoming…</p>
        )}
      </div>

      {/* Self-officiated: listener can self-report */}
      {isSelfOfficiated && flipped && (
        <button
          onClick={onLaughReport}
          disabled={processing}
          className="w-full max-w-xs py-5 rounded-2xl bg-red-500 text-white font-black text-xl uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
        >
          😂 I LAUGHED
        </button>
      )}
    </div>
  )
}

interface RefPanelViewProps {
  room: Room
  players: Player[]
  rounds: Round[]
  teller: Player | undefined
  listener: Player | undefined
  flipped: boolean
  processing: boolean
  onReveal: () => void
  onLaughed: () => void
  onNoLaugh: () => void
}

function RefPanelView({
  room, players, rounds, teller, listener,
  flipped, processing, onReveal, onLaughed, onNoLaugh,
}: RefPanelViewProps) {
  const [showScore, setShowScore] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-6 gap-4">
      <div className="w-full max-w-sm space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest">🎙️ REF PANEL</p>
          <button
            onClick={() => setShowScore((s) => !s)}
            className="text-xs text-gray-500 border border-gray-800 rounded-lg px-3 py-1"
          >
            {showScore ? 'Hide scores' : 'Scores'}
          </button>
        </div>

        {showScore && (
          <Scoreboard room={room} players={players} rounds={rounds} />
        )}

        {/* Round info */}
        <div className="text-center space-y-1">
          <p className="text-gray-600 text-xs uppercase tracking-widest">Round {room.round_number}</p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-green-400 uppercase tracking-widest">Teller</p>
              <p className="font-black text-lg">{teller?.name ?? '—'}</p>
            </div>
            <div className="text-gray-700 text-2xl font-black self-center">vs</div>
            <div className="text-center">
              <p className="text-xs text-red-400 uppercase tracking-widest">Listener</p>
              <p className="font-black text-lg">{listener?.name ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Ref doesn't see the joke — just controls */}
        <div className="bg-gray-950 rounded-3xl p-5 border border-gray-800 text-center space-y-3">
          <p className="text-gray-500 text-sm">
            {flipped ? 'Punchline has been revealed.' : 'Joke in progress…'}
          </p>
          {!flipped && (
            <button
              onClick={onReveal}
              className="w-full py-3 rounded-xl bg-yellow-400 text-black font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
            >
              Reveal Punchline 🥁
            </button>
          )}
        </div>

        {/* Ref controls — only after reveal */}
        {flipped && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onLaughed}
              disabled={processing}
              className="py-5 rounded-2xl bg-red-500 text-white font-black text-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
            >
              😂 LAUGHED
            </button>
            <button
              onClick={onNoLaugh}
              disabled={processing}
              className="py-5 rounded-2xl bg-green-600 text-white font-black text-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
            >
              😐 HELD IT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SpectatorView({
  room, players, rounds, teller, listener, joke, flipped,
}: {
  room: Room
  players: Player[]
  rounds: Round[]
  teller: Player | undefined
  listener: Player | undefined
  joke: JokeData
  flipped: boolean
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-8 gap-6">
      <div className="w-full max-w-sm space-y-4">
        <p className="text-xs text-gray-500 text-center uppercase tracking-widest">Spectating · Round {room.round_number}</p>
        <div className="flex justify-center gap-6 text-center">
          <div>
            <p className="text-xs text-green-400 uppercase tracking-widest">Telling</p>
            <p className="font-black">{teller?.name ?? '—'}</p>
          </div>
          <div className="text-gray-700 text-xl font-black self-center">vs</div>
          <div>
            <p className="text-xs text-red-400 uppercase tracking-widest">Listening</p>
            <p className="font-black">{listener?.name ?? '—'}</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-3xl p-5 space-y-3 border border-gray-800">
          <p className="font-bold text-lg leading-snug">{joke.q}</p>
          {flipped && (
            <div className="border-t border-gray-700 pt-3">
              <p className="text-yellow-400 font-black text-xl">{joke.a}</p>
            </div>
          )}
        </div>
        <Scoreboard room={room} players={players} rounds={rounds} label="Standings" />
      </div>
    </div>
  )
}

// Simple CSS confetti
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i)
  const colors = ['#facc15', '#f87171', '#4ade80', '#60a5fa', '#e879f9', '#fb923c']
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20 + 5}%`,
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 10 + 6}px`,
            background: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s infinite`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); }
        }
      `}</style>
    </div>
  )
}
