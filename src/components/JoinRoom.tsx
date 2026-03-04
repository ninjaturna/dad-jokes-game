import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId, saveIdentity, identityMatchesRoom } from '../lib/device'

export default function JoinRoom() {
  const { code } = useParams<{ code?: string }>()
  const navigate = useNavigate()

  const [joinCode, setJoinCode] = useState((code ?? '').toUpperCase())
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If a code is in the URL and device already joined this room, redirect straight in
  useEffect(() => {
    if (!code) return
    const existing = identityMatchesRoom(code)
    if (existing) {
      navigate(`/lobby/${code.toUpperCase()}`, { replace: true })
    }
  }, [code, navigate])

  async function join() {
    const trimmedCode = joinCode.trim().toUpperCase()
    const trimmedName = name.trim()

    if (!trimmedCode || trimmedCode.length !== 6) {
      setError('Enter the 6-character room code')
      return
    }
    if (!trimmedName) {
      setError('Enter your name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Look up the room
      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .select('id, status, mode, join_code')
        .eq('join_code', trimmedCode)
        .single()

      if (roomErr || !room) {
        setError('Room not found — check the code')
        return
      }
      if (room.status !== 'lobby') {
        setError('That game has already started')
        return
      }

      const deviceId = getDeviceId()

      // Check if this device already has a player in this room
      const { data: existing } = await supabase
        .from('players')
        .select('id, name')
        .eq('room_id', room.id)
        .eq('device_id', deviceId)
        .maybeSingle()

      if (existing) {
        // Reconnect
        saveIdentity({
          device_id: deviceId,
          player_id: existing.id,
          room_id: room.id,
          join_code: trimmedCode,
        })
        navigate(`/lobby/${trimmedCode}`)
        return
      }

      // Check for name collision
      const { data: nameTaken } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', room.id)
        .ilike('name', trimmedName)
        .maybeSingle()

      if (nameTaken) {
        setError('That name is taken — pick another')
        return
      }

      // Insert new player
      const { data: player, error: playerErr } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: trimmedName,
          is_host: false,
          device_id: deviceId,
          team: room.mode === 'teams' ? 1 : null, // default to team 1; host can reassign
        })
        .select()
        .single()
      if (playerErr) throw playerErr

      // Fire player_joined event
      await supabase.from('game_events').insert({
        room_id: room.id,
        event_type: 'player_joined',
        payload: { player_id: player.id, name: player.name, team: player.team },
        triggered_by: player.id,
      })

      saveIdentity({
        device_id: deviceId,
        player_id: player.id,
        room_id: room.id,
        join_code: trimmedCode,
      })

      navigate(`/lobby/${trimmedCode}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black tracking-tight">JOIN GAME</h1>
          <p className="text-gray-400 text-sm">Enter the code from the host's screen</p>
        </div>

        {/* Room code */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Room Code
          </label>
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-2xl text-center font-black tracking-widest placeholder-gray-600 focus:outline-none focus:border-white uppercase"
            placeholder="WOLF42"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            maxLength={6}
            autoFocus={!code}
            spellCheck={false}
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Your Name
          </label>
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-white"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            maxLength={20}
            autoFocus={!!code}
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={join}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Joining…' : 'Join Game'}
        </button>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 text-sm underline underline-offset-2"
          >
            Create a new room instead
          </button>
        </div>
      </div>
    </div>
  )
}
