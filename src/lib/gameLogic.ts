import type { Player, GameMode } from '../types/game'

// Fisher-Yates shuffle
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a shuffled deck of joke indices (0-based) filtered by category
export function buildDeck(
  totalJokes: number,
  categoryIds?: number[] | null,
): number[] {
  const ids = categoryIds ?? Array.from({ length: totalJokes }, (_, i) => i)
  return shuffle(ids)
}

// Pick the initial teller/listener pair given a fresh player list
export function pickFirstPair(
  players: Player[],
  mode: GameMode,
): { teller: Player; listener: Player } | null {
  const alive = players.filter((p) => p.is_alive)
  if (alive.length < 2) return null

  if (mode === '1v1') {
    return { teller: alive[0], listener: alive[1] }
  }

  // teams: one player per team
  const team0 = alive.find((p) => p.team === 0)
  const team1 = alive.find((p) => p.team === 1)
  if (!team0 || !team1) return null
  return { teller: team0, listener: team1 }
}

// After an elimination, find the next valid teller/listener pair
// The teller keeps their role; find the next alive listener on the other team
export function nextPairAfterElimination(
  players: Player[],
  currentTellerId: string,
  mode: GameMode,
): { teller: Player; listener: Player } | null {
  const alive = players.filter((p) => p.is_alive)
  const teller = alive.find((p) => p.id === currentTellerId)
  if (!teller) return null

  if (mode === '1v1') {
    const listener = alive.find((p) => p.id !== currentTellerId)
    if (!listener) return null
    return { teller, listener }
  }

  const listenerTeam = teller.team === 0 ? 1 : 0
  const listener = alive.find((p) => p.team === listenerTeam)
  if (!listener) return null
  return { teller, listener }
}

// Advance to the next turn (no laugh: swap teller/listener)
export function nextTurnPair(
  players: Player[],
  currentTellerId: string,
  currentListenerId: string,
  mode: GameMode,
): { teller: Player; listener: Player } | null {
  const alive = players.filter((p) => p.is_alive)

  if (mode === '1v1') {
    const newTeller = alive.find((p) => p.id === currentListenerId)
    const newListener = alive.find((p) => p.id === currentTellerId)
    if (!newTeller || !newListener) return null
    return { teller: newTeller, listener: newListener }
  }

  // teams: rotate within teams
  const tellerTeamPlayers = alive.filter(
    (p) => p.team === alive.find((q) => q.id === currentTellerId)?.team,
  )
  const listenerTeamPlayers = alive.filter(
    (p) => p.team === alive.find((q) => q.id === currentListenerId)?.team,
  )

  // New teller = next alive on current listener's team
  const nextTellerIdx =
    (listenerTeamPlayers.findIndex((p) => p.id === currentListenerId) + 1) %
    listenerTeamPlayers.length
  const nextListenerIdx =
    (tellerTeamPlayers.findIndex((p) => p.id === currentTellerId) + 1) %
    tellerTeamPlayers.length

  const newTeller = listenerTeamPlayers[nextTellerIdx]
  const newListener = tellerTeamPlayers[nextListenerIdx]
  if (!newTeller || !newListener) return null
  return { teller: newTeller, listener: newListener }
}

// Check if the game is over (returns winning team index for teams mode, or null)
export function checkGameOver(
  players: Player[],
  mode: GameMode,
): { type: 'player' | 'team'; winnerId?: string; teamIdx?: 0 | 1 } | null {
  const alive = players.filter((p) => p.is_alive)

  if (mode === '1v1') {
    if (alive.length === 1) return { type: 'player', winnerId: alive[0].id }
    if (alive.length === 0) return null
    return null
  }

  const team0Alive = alive.filter((p) => p.team === 0)
  const team1Alive = alive.filter((p) => p.team === 1)

  if (team0Alive.length === 0) return { type: 'team', teamIdx: 1 }
  if (team1Alive.length === 0) return { type: 'team', teamIdx: 0 }
  return null
}
