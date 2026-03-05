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

// Active players: alive AND not a dedicated ref
function getActivePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.is_alive && p.role !== 'host')
}

// Pick the initial teller/listener pair given a fresh player list
export function pickFirstPair(
  players: Player[],
  mode: GameMode,
): { teller: Player; listener: Player } | null {
  const active = getActivePlayers(players)
  if (active.length < 2) return null

  if (mode === '1v1') {
    return { teller: active[0], listener: active[1] }
  }

  const team0 = active.find((p) => p.team === 0)
  const team1 = active.find((p) => p.team === 1)
  if (!team0 || !team1) return null
  return { teller: team0, listener: team1 }
}

// After an elimination, find the next valid teller/listener pair
export function nextPairAfterElimination(
  players: Player[],
  currentTellerId: string,
  mode: GameMode,
): { teller: Player; listener: Player } | null {
  const active = getActivePlayers(players)
  const teller = active.find((p) => p.id === currentTellerId)
  if (!teller) return null

  if (mode === '1v1') {
    const listener = active.find((p) => p.id !== currentTellerId)
    if (!listener) return null
    return { teller, listener }
  }

  const listenerTeam = teller.team === 0 ? 1 : 0
  const listener = active.find((p) => p.team === listenerTeam)
  if (!listener) return null
  return { teller, listener }
}

// Advance to the next turn (no laugh: swap teller/listener, rotate within teams)
export function nextTurnPair(
  players: Player[],
  currentTellerId: string,
  currentListenerId: string,
  mode: GameMode,
): { teller: Player; listener: Player } | null {
  const active = getActivePlayers(players)

  if (mode === '1v1') {
    const newTeller = active.find((p) => p.id === currentListenerId)
    const newListener = active.find((p) => p.id === currentTellerId)
    if (!newTeller || !newListener) return null
    return { teller: newTeller, listener: newListener }
  }

  const currentTellerTeam = active.find((q) => q.id === currentTellerId)?.team
  const currentListenerTeam = active.find((q) => q.id === currentListenerId)?.team

  const tellerTeamPlayers = active.filter((p) => p.team === currentTellerTeam)
  const listenerTeamPlayers = active.filter((p) => p.team === currentListenerTeam)

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

// Check if the game is over — only considers role='player' participants
export function checkGameOver(
  players: Player[],
  mode: GameMode,
): { type: 'player' | 'team'; winnerId?: string; teamIdx?: 0 | 1 } | null {
  const participants = players.filter((p) => p.role !== 'host')
  const alive = participants.filter((p) => p.is_alive)

  if (mode === '1v1') {
    if (alive.length === 1) return { type: 'player', winnerId: alive[0].id }
    return null
  }

  const team0Alive = alive.filter((p) => p.team === 0)
  const team1Alive = alive.filter((p) => p.team === 1)

  if (team0Alive.length === 0 && team1Alive.length > 0) return { type: 'team', teamIdx: 1 }
  if (team1Alive.length === 0 && team0Alive.length > 0) return { type: 'team', teamIdx: 0 }
  return null
}
