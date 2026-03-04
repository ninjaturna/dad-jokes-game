import type { Player, Round, Room } from '../types/game'

interface Props {
  room: Room
  players: Player[]
  rounds: Round[]
  onContinue?: () => void
  showContinue?: boolean
  label?: string
}

export default function Scoreboard({ room, players, rounds, onContinue, showContinue, label }: Props) {
  const completedRounds = rounds.filter((r) => r.laughed !== null)

  if (room.mode === '1v1') {
    return (
      <div className="space-y-3">
        {label && (
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
            {label}
          </p>
        )}
        <div className="space-y-2">
          {players.map((p) => {
            const roundsWon = completedRounds.filter((r) => r.teller_id === p.id && r.laughed).length
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  p.is_alive ? 'bg-gray-900' : 'bg-gray-950 opacity-50'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    p.is_alive ? 'bg-green-400' : 'bg-red-500'
                  }`}
                />
                <span className="flex-1 font-semibold truncate">{p.name}</span>
                <span className="text-yellow-400 font-black text-lg">{roundsWon}</span>
                <span className="text-gray-600 text-xs">eliminations</span>
              </div>
            )
          })}
        </div>
        {showContinue && onContinue && (
          <button
            onClick={onContinue}
            className="w-full py-4 mt-4 rounded-2xl bg-white text-black font-black text-lg uppercase tracking-widest active:scale-95 transition-transform"
          >
            Continue
          </button>
        )}
      </div>
    )
  }

  // Teams mode
  return (
    <div className="space-y-4">
      {label && (
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
          {label}
        </p>
      )}
      {([0, 1] as const).map((teamIdx) => {
        const teamPlayers = players.filter((p) => p.team === teamIdx)
        const teamName = teamIdx === 0 ? room.team_0_name : room.team_1_name
        const aliveCount = teamPlayers.filter((p) => p.is_alive).length
        return (
          <div key={teamIdx} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">
                {teamIdx === 0 ? '🔥' : '🧊'} {teamName}
              </span>
              <span className={`text-xs font-bold ${aliveCount > 0 ? 'text-green-400' : 'text-red-500'}`}>
                {aliveCount} alive
              </span>
            </div>
            {teamPlayers.map((p) => {
              const elims = completedRounds.filter(
                (r) => r.teller_id === p.id && r.laughed,
              ).length
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2 ${
                    p.is_alive ? 'bg-gray-900' : 'bg-gray-950 opacity-40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      p.is_alive ? 'bg-green-400' : 'bg-red-500'
                    }`}
                  />
                  <span className="flex-1 font-medium text-sm truncate">{p.name}</span>
                  {elims > 0 && (
                    <span className="text-yellow-400 text-xs font-bold">{elims} 💀</span>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
      {showContinue && onContinue && (
        <button
          onClick={onContinue}
          className="w-full py-4 mt-2 rounded-2xl bg-white text-black font-black text-lg uppercase tracking-widest active:scale-95 transition-transform"
        >
          Continue
        </button>
      )}
    </div>
  )
}
