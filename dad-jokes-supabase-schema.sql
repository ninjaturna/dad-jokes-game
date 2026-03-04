-- ============================================================
-- DAD JOKES GAME — Supabase Schema
-- ============================================================
-- Features supported:
--   1. QR code / link room joining
--   2. Per-device game views (teller vs listener)
--   3. Scoreboard across rounds
--   4. Sound effect triggers (server-driven events)
--   5. Joke category filtering
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ROOMS
-- The top-level game session. Created by the host.
-- ============================================================
CREATE TABLE rooms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Short human-readable join code (e.g. "WOLF42")
  -- Used to generate the join URL: dadjokes.app/join/WOLF42
  join_code     TEXT NOT NULL UNIQUE,

  -- Game configuration
  mode          TEXT NOT NULL DEFAULT '1v1'       -- '1v1' | 'teams'
                CHECK (mode IN ('1v1', 'teams')),

  status        TEXT NOT NULL DEFAULT 'lobby'     -- 'lobby' | 'playing' | 'finished'
                CHECK (status IN ('lobby', 'playing', 'finished')),

  -- Team names (only used when mode = 'teams')
  team_0_name   TEXT DEFAULT 'TEAM FIRE',
  team_1_name   TEXT DEFAULT 'TEAM ICE',

  -- Active joke category filter (NULL = all jokes)
  -- Matches the 'category' column in the jokes table
  active_category TEXT DEFAULT NULL,

  -- Shuffled joke index order for this game session
  -- Stored as a JSON array of joke IDs: [42, 7, 391, ...]
  -- Avoids repeats, survives page refreshes
  deck_order    JSONB NOT NULL DEFAULT '[]',

  -- Current position in the deck
  deck_index    INTEGER NOT NULL DEFAULT 0,

  -- Current round number (increments on every turn)
  round_number  INTEGER NOT NULL DEFAULT 1,

  -- Who is currently telling vs listening (FK set after players are created)
  current_teller_id   UUID REFERENCES players(id) ON DELETE SET NULL,
  current_listener_id UUID REFERENCES players(id) ON DELETE SET NULL,

  -- The player who created the room (has host/ref controls)
  host_id       UUID REFERENCES players(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast join code lookups
CREATE INDEX idx_rooms_join_code ON rooms(join_code);
CREATE INDEX idx_rooms_status ON rooms(status);


-- ============================================================
-- PLAYERS
-- Anyone who joined the room. One row per device per game.
-- ============================================================
CREATE TABLE players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,

  name          TEXT NOT NULL,

  -- Team assignment: 0 or 1 (NULL for 1v1 mode)
  team          INTEGER DEFAULT NULL
                CHECK (team IN (0, 1)),

  -- Elimination state
  is_alive      BOOLEAN NOT NULL DEFAULT TRUE,

  -- Role flags
  is_host       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Device fingerprint so the same device can reconnect
  -- after a refresh without re-entering their name
  -- Generated client-side (e.g. crypto.randomUUID stored in localStorage)
  device_id     TEXT,

  -- Track wins across rematches in same session
  wins          INTEGER NOT NULL DEFAULT 0,

  -- Track how many times this player made someone laugh (jokes delivered successfully)
  jokes_survived INTEGER NOT NULL DEFAULT 0,

  -- Track how many times they laughed and got eliminated
  times_eliminated INTEGER NOT NULL DEFAULT 0,

  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_device_id ON players(device_id);
CREATE INDEX idx_players_room_alive ON players(room_id, is_alive);


-- ============================================================
-- ROUNDS
-- One row per turn. Drives the scoreboard and history.
-- ============================================================
CREATE TABLE rounds (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,

  round_number  INTEGER NOT NULL,

  -- Who was on which side this turn
  teller_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  listener_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Which joke was used (index into the JOKES array)
  joke_index    INTEGER NOT NULL,

  -- Outcome: true = listener laughed (teller wins the round)
  --          false = listener held it (no elimination)
  laughed       BOOLEAN DEFAULT NULL, -- NULL = round in progress

  -- Timestamp for scoreboard ordering
  completed_at  TIMESTAMPTZ DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rounds_room_id ON rounds(room_id);
CREATE INDEX idx_rounds_room_number ON rounds(room_id, round_number);


-- ============================================================
-- JOKES
-- The full joke deck as a DB table.
-- Enables category filtering, future admin editing, and stats.
-- ============================================================
CREATE TABLE jokes (
  id            SERIAL PRIMARY KEY,

  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,

  -- Category tag for filtering (e.g. 'sports', 'celebrity', 'clean', 'spicy')
  -- NULL = uncategorized (all jokes)
  category      TEXT DEFAULT NULL,

  -- Source pack (for future expansion — you can add new joke packs)
  pack          TEXT NOT NULL DEFAULT 'black_cafe',

  -- Soft disable without deleting
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,

  -- Usage stats (nice to have for future sorting)
  times_used    INTEGER NOT NULL DEFAULT 0,
  times_laughed INTEGER NOT NULL DEFAULT 0, -- how often this joke got someone eliminated

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jokes_category ON jokes(category);
CREATE INDEX idx_jokes_pack ON jokes(pack);
CREATE INDEX idx_jokes_active ON jokes(is_active);


-- ============================================================
-- GAME_EVENTS
-- Real-time event log. Supabase Realtime subscribes to this.
-- Each client INSERT triggers a broadcast to all room subscribers.
-- This replaces direct row polling — much cleaner for live game state.
-- ============================================================
CREATE TABLE game_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,

  -- Event types:
  --   'player_joined'    → new player entered lobby
  --   'game_started'     → host pressed Start
  --   'joke_revealed'    → teller flipped the card
  --   'laughed'          → ref pressed laughed button
  --   'turn_passed'      → no laugh, next player's turn
  --   'player_eliminated'→ player is out
  --   'game_over'        → winner determined
  --   'rematch'          → same players, new game
  --   'sound_trigger'    → play a specific sound effect
  event_type    TEXT NOT NULL,

  -- Flexible payload per event type (see notes below)
  payload       JSONB NOT NULL DEFAULT '{}',

  -- Who triggered this event (NULL for system events)
  triggered_by  UUID REFERENCES players(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_room_id ON game_events(room_id);
CREATE INDEX idx_events_room_type ON game_events(room_id, event_type);
CREATE INDEX idx_events_created ON game_events(room_id, created_at DESC);

-- ============================================================
-- Event payload shapes (for Claude Code reference):
--
-- 'player_joined':
--   { player_id, name, team }
--
-- 'game_started':
--   { mode, deck_order: [int], teller_id, listener_id }
--
-- 'joke_revealed':
--   { joke_index, question, answer }
--
-- 'laughed':
--   { listener_id, teller_id, round_number }
--
-- 'player_eliminated':
--   { player_id, name, team, survivors_on_team: int }
--
-- 'game_over':
--   { winner_type: 'player'|'team', winner_id, winner_team: 0|1, winner_name }
--
-- 'sound_trigger':
--   { sound: 'rimshot'|'elimination'|'winner_fanfare'|'tick' }
--
-- 'rematch':
--   { new_deck_order: [int], teller_id, listener_id }
-- ============================================================


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE rooms       ENABLE ROW LEVEL SECURITY;
ALTER TABLE players     ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds      ENABLE ROW LEVEL SECURITY;
ALTER TABLE jokes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Public read on active rooms (needed for join flow)
CREATE POLICY "rooms_public_read"
  ON rooms FOR SELECT USING (true);

-- Anyone can create a room (anonymous users)
CREATE POLICY "rooms_public_insert"
  ON rooms FOR INSERT WITH CHECK (true);

-- Only updates from service role (server-side logic) or host device
-- In practice, use a Supabase Edge Function for all game state mutations
CREATE POLICY "rooms_update_service"
  ON rooms FOR UPDATE USING (true); -- Tighten in production

-- Players: public read within the same room
CREATE POLICY "players_public_read"
  ON players FOR SELECT USING (true);

CREATE POLICY "players_public_insert"
  ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "players_self_update"
  ON players FOR UPDATE USING (true); -- Tighten in production

-- Rounds: public read (for scoreboard)
CREATE POLICY "rounds_public_read"
  ON rounds FOR SELECT USING (true);

CREATE POLICY "rounds_insert_service"
  ON rounds FOR INSERT WITH CHECK (true);

-- Jokes: public read always
CREATE POLICY "jokes_public_read"
  ON jokes FOR SELECT USING (is_active = true);

-- Game events: public read and insert (Realtime driven)
CREATE POLICY "events_public_read"
  ON game_events FOR SELECT USING (true);

CREATE POLICY "events_public_insert"
  ON game_events FOR INSERT WITH CHECK (true);


-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable Realtime on these tables in Supabase Dashboard
-- OR via CLI:
-- ============================================================

-- supabase realtime enable game_events  ← PRIMARY subscription channel
-- supabase realtime enable rooms         ← for lobby player list updates
-- supabase realtime enable players       ← for player join/elimination

-- Client subscription pattern (for Claude Code):
--
-- supabase
--   .channel(`room:${roomId}`)
--   .on('postgres_changes', {
--       event: 'INSERT',
--       schema: 'public',
--       table: 'game_events',
--       filter: `room_id=eq.${roomId}`
--   }, handleGameEvent)
--   .subscribe()


-- ============================================================
-- HELPER FUNCTION: Generate a unique join code
-- Call this when creating a new room.
-- Returns a 6-char alphanumeric code like "WOLF42"
-- ============================================================
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I, O, 0, 1 (confusing)
  code TEXT := '';
  i INTEGER;
  collision BOOLEAN;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM rooms WHERE join_code = code) INTO collision;
    EXIT WHEN NOT collision;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- HELPER FUNCTION: Auto-update updated_at on rooms
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- SEED: Insert all 493 jokes
-- Run this once after schema creation.
-- (Claude Code should generate the full INSERT from the CSV)
-- ============================================================

-- Example seed format:
-- INSERT INTO jokes (question, answer, category, pack) VALUES
--   ('Why don''t Pirates ever go to jail?', 'They always get off the hook', 'classic', 'black_cafe'),
--   ('What do you call a man with a rubber toe?', 'Roberto', 'classic', 'black_cafe'),
--   ... (493 rows total)
-- ;

-- ============================================================
-- FUTURE TABLES (don't build yet, just plan for them)
-- ============================================================

-- game_sessions: tracks full game history across rematches
--   → useful if you ever add persistent user accounts

-- player_stats: lifetime wins, eliminations across all games
--   → requires auth, skip for v1

-- joke_reactions: crowd upvotes on jokes, "funniest of the night"
--   → fun party feature for v2
