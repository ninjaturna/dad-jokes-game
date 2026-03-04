import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDeviceId, saveIdentity } from '../lib/device'
import type { GameMode, JokeCategory } from '../types/game'

const CATEGORIES: { label: string; value: JokeCategory }[] = [
  { label: 'All Jokes', value: null },
  { label: 'Classic', value: 'classic' },
  { label: 'Sports', value: 'sports' },
  { label: 'Celebrity', value: 'celebrity' },
  { label: 'Spicy 🌶', value: 'spicy' },
]

export default function Home() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<GameMode>('1v1')
  const [category, setCategory] = useState<JokeCategory>(null)
  const [hostName, setHostName] = useState('')
  const [team0, setTeam0] = useState('TEAM FIRE')
  const [team1, setTeam1] = useState('TEAM ICE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createRoom() {
    if (!hostName.trim()) {
      setError('Enter your name first')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Generate join code via Supabase function
      const { data: codeData, error: codeErr } = await supabase
        .rpc('generate_join_code')
      if (codeErr) throw codeErr
      const joinCode = codeData as string

      // Create the room (host_id set after player insert)
      const { data: room, error: roomErr } = await supabase
        .from('rooms')
        .insert({
          join_code: joinCode,
          mode,
          status: 'lobby',
          team_0_name: team0.trim() || 'TEAM FIRE',
          team_1_name: team1.trim() || 'TEAM ICE',
          active_category: category,
          deck_order: [],
        })
        .select()
        .single()
      if (roomErr) throw roomErr

      const deviceId = getDeviceId()

      // Create the host player
      const { data: player, error: playerErr } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          name: hostName.trim(),
          is_host: true,
          device_id: deviceId,
          team: mode === 'teams' ? 0 : null,
        })
        .select()
        .single()
      if (playerErr) throw playerErr

      // Set host_id on the room
      await supabase
        .from('rooms')
        .update({ host_id: player.id })
        .eq('id', room.id)

      saveIdentity({
        device_id: deviceId,
        player_id: player.id,
        room_id: room.id,
        join_code: joinCode,
      })

      navigate(`/lobby/${joinCode}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-5xl font-black tracking-tight">DAD JOKES</h1>
          <p className="text-gray-400 text-sm">The straight-face survival game</p>
        </div>

        {/* Host name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Your Name
          </label>
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-white"
            placeholder="Enter your name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createRoom()}
            maxLength={20}
            autoFocus
          />
        </div>

        {/* Mode selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['1v1', 'teams'] as GameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-3 rounded-xl font-bold text-sm uppercase tracking-widest border transition-colors ${
                  mode === m
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {m === '1v1' ? '1 v 1' : 'Teams'}
              </button>
            ))}
          </div>
        </div>

        {/* Team names (teams mode only) */}
        {mode === 'teams' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Team Names
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white"
                value={team0}
                onChange={(e) => setTeam0(e.target.value)}
                maxLength={16}
                placeholder="Team 1"
              />
              <input
                className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                maxLength={16}
                placeholder="Team 2"
              />
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Joke Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={String(value)}
                onClick={() => setCategory(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-colors ${
                  category === value
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Create room button */}
        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-white text-black font-black text-xl uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Creating…' : 'Create Room'}
        </button>

        {/* Join existing room */}
        <div className="text-center">
          <span className="text-gray-600 text-sm">Joining someone else's game? </span>
          <button
            onClick={() => navigate('/join/')}
            className="text-white text-sm underline underline-offset-2"
          >
            Enter code
          </button>
        </div>
      </div>
    </div>
  )
}
