// Mirrors the Supabase DB schema exactly.
// Null fields match DB DEFAULT NULL columns.

export type GameMode = '1v1' | 'teams'
export type RoomStatus = 'lobby' | 'playing' | 'finished'
export type JokeCategory = 'classic' | 'sports' | 'celebrity' | 'spicy' | null
export type OfficiationMode = 'dedicated_host' | 'self_officiated'
export type PlayerRole = 'player' | 'host'

export interface Room {
  id: string
  join_code: string
  mode: GameMode
  status: RoomStatus
  team_0_name: string
  team_1_name: string
  active_category: JokeCategory
  officiation_mode: OfficiationMode
  deck_order: number[]
  deck_index: number
  round_number: number
  current_teller_id: string | null
  current_listener_id: string | null
  host_id: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  room_id: string
  name: string
  team: 0 | 1 | null
  is_alive: boolean
  is_host: boolean
  role: PlayerRole
  device_id: string | null
  wins: number
  jokes_survived: number
  times_eliminated: number
  joined_at: string
}

export interface Round {
  id: string
  room_id: string
  round_number: number
  teller_id: string
  listener_id: string
  joke_index: number
  laughed: boolean | null
  completed_at: string | null
  created_at: string
}

export interface Joke {
  id: number
  question: string
  answer: string
  category: JokeCategory
  pack: string
  is_active: boolean
  times_used: number
  times_laughed: number
  created_at: string
}

export type SoundTrigger = 'rimshot' | 'elimination' | 'winner_fanfare' | 'tick'

export type GameEventType =
  | 'player_joined'
  | 'game_started'
  | 'joke_revealed'
  | 'laughed'
  | 'laughed_self_report'
  | 'turn_passed'
  | 'player_eliminated'
  | 'game_over'
  | 'rematch'
  | 'sound_trigger'
  | 'officiation_set'

export interface GameEvent {
  id: string
  room_id: string
  event_type: GameEventType
  payload: Record<string, unknown>
  triggered_by: string | null
  created_at: string
}

// Client-side device identity (stored in localStorage)
export interface DeviceIdentity {
  device_id: string      // crypto.randomUUID()
  player_id: string      // the players.id this device registered as
  room_id: string        // the room this device joined
  join_code: string
}
