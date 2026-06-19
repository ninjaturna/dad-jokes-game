-- Black Cafe @ Marly's Yard — schema (additive). Run statements individually.
create extension if not exists "uuid-ossp";

-- Host profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now()
);

-- Events
create table events (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references profiles(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  host_note text,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text not null default 'America/New_York',
  location_name text,
  location_address text,
  location_url text,
  image_url text,
  audience text not null default 'all' check (audience in ('all','kid_friendly','adults')),
  allow_plus_ones boolean not null default true,
  plus_one_max int not null default 2,
  capacity int,
  visibility text not null default 'unlisted' check (visibility in ('private','unlisted','public')),
  allow_guest_invites boolean not null default false,
  approve_guests boolean not null default false,
  series_id uuid,
  recurrence text,
  status text not null default 'draft' check (status in ('draft','published','passed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_events_slug on events(slug);
create index idx_events_host on events(host_id);
create index idx_events_status on events(status);

-- Host's contacts
create table guests (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
create index idx_guests_host on guests(host_id);

create table lists (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create table list_members (
  list_id uuid not null references lists(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  primary key (list_id, guest_id)
);

-- RSVPs (no-account; device_id de-dupes)
create table rsvps (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  name text not null,
  email text,
  phone text,
  response text not null check (response in ('yes','maybe','no')),
  plus_ones int not null default 0,
  kids int not null default 0,
  status text not null default 'confirmed' check (status in ('confirmed','pending','declined')),
  note text,
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_rsvps_event on rsvps(event_id);
create unique index idx_rsvps_event_device on rsvps(event_id, device_id) where device_id is not null;

-- Polls (date / dietary / custom)
create table polls (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  type text not null default 'custom' check (type in ('date','dietary','custom')),
  question text,
  status text not null default 'open' check (status in ('open','locked')),
  locked_option_id uuid,
  created_at timestamptz not null default now()
);
create table poll_options (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references polls(id) on delete cascade,
  label text not null,
  sort int not null default 0
);
create table poll_votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  voter_name text,
  device_id text,
  created_at timestamptz not null default now()
);
create index idx_poll_votes_poll on poll_votes(poll_id);

-- Potluck / sign-up slots
create table potluck_slots (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  claimed_by_name text,
  claimed_by_device text,
  created_at timestamptz not null default now()
);
create index idx_potluck_event on potluck_slots(event_id);

-- Extra invite pages
create table info_pages (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  type text not null check (type in ('itinerary','menu','tracklist','games','custom')),
  title text not null,
  body jsonb not null default '{}',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_info_pages_event on info_pages(event_id);

-- Community (Phase 2) — feed, photos, playlist
create table community_posts (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  author_name text,
  body text,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create table post_likes (
  post_id uuid not null references community_posts(id) on delete cascade,
  device_id text not null,
  primary key (post_id, device_id)
);
create table photos (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references profiles(id) on delete set null,
  event_id uuid references events(id) on delete cascade,
  storage_path text not null,
  uploader_name text,
  created_at timestamptz not null default now()
);
create table playlist_tracks (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  title text not null,
  artist text,
  contributor_name text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- Ticketing (Phase 2)
create table ticket_tiers (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  price_cents int not null default 0,
  quantity int,
  created_at timestamptz not null default now()
);
create table ticket_orders (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  tier_id uuid references ticket_tiers(id) on delete set null,
  buyer_name text,
  buyer_email text,
  quantity int not null default 1,
  amount_cents int not null default 0,
  stripe_session_id text,
  status text not null default 'pending' check (status in ('pending','paid','refunded')),
  created_at timestamptz not null default now()
);

-- updated_at trigger (function may already exist from the game schema — replace is safe)
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger events_updated_at before update on events for each row execute function update_updated_at();
create trigger rsvps_updated_at before update on rsvps for each row execute function update_updated_at();

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table guests enable row level security;
alter table lists enable row level security;
alter table list_members enable row level security;
alter table rsvps enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;
alter table potluck_slots enable row level security;
alter table info_pages enable row level security;
alter table community_posts enable row level security;
alter table post_likes enable row level security;
alter table photos enable row level security;
alter table playlist_tracks enable row level security;
alter table ticket_tiers enable row level security;
alter table ticket_orders enable row level security;

-- profiles: self
create policy profiles_self on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- events: host full; anyone can read a PUBLISHED event (link/slug is the gate)
create policy events_host_all on events for all using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy events_public_read on events for select using (status = 'published');

-- helper: is an event published?
create or replace function event_is_published(eid uuid) returns boolean as $$
  select exists(select 1 from events e where e.id = eid and e.status = 'published');
$$ language sql stable;

-- rsvps: public read + insert for published events; host full via event ownership
create policy rsvps_public_read on rsvps for select using (event_is_published(event_id));
create policy rsvps_public_insert on rsvps for insert with check (event_is_published(event_id));
create policy rsvps_host_all on rsvps for all
  using (exists (select 1 from events e where e.id = rsvps.event_id and e.host_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = rsvps.event_id and e.host_id = auth.uid()));

-- guests / lists: host-only
create policy guests_host_all on guests for all using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy lists_host_all on lists for all using (auth.uid() = host_id) with check (auth.uid() = host_id);
create policy list_members_host_all on list_members for all
  using (exists (select 1 from lists l where l.id = list_members.list_id and l.host_id = auth.uid()))
  with check (exists (select 1 from lists l where l.id = list_members.list_id and l.host_id = auth.uid()));

-- polls/options/votes/potluck/info: public read + guest write for published events
create policy polls_public_read on polls for select using (event_is_published(event_id));
create policy poll_options_public_read on poll_options for select using (exists (select 1 from polls p where p.id = poll_options.poll_id and event_is_published(p.event_id)));
create policy poll_votes_public on poll_votes for select using (exists (select 1 from polls p where p.id = poll_votes.poll_id and event_is_published(p.event_id)));
create policy poll_votes_insert on poll_votes for insert with check (exists (select 1 from polls p where p.id = poll_votes.poll_id and event_is_published(p.event_id)));
create policy potluck_public_read on potluck_slots for select using (event_is_published(event_id));
create policy potluck_claim on potluck_slots for update using (event_is_published(event_id)) with check (event_is_published(event_id));
create policy info_pages_public_read on info_pages for select using (event_is_published(event_id));

-- community/photos/playlist: public read + insert (MVP; tighten later)
create policy community_read on community_posts for select using (true);
create policy community_insert on community_posts for insert with check (true);
create policy post_likes_all on post_likes for all using (true) with check (true);
create policy photos_read on photos for select using (true);
create policy photos_insert on photos for insert with check (true);
create policy playlist_read on playlist_tracks for select using (true);
create policy playlist_insert on playlist_tracks for insert with check (true);

-- ticketing: host manages tiers; orders written server-side (service role bypasses RLS)
create policy ticket_tiers_host on ticket_tiers for all
  using (exists (select 1 from events e where e.id = ticket_tiers.event_id and e.host_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = ticket_tiers.event_id and e.host_id = auth.uid()));
create policy ticket_tiers_public_read on ticket_tiers for select using (event_is_published(event_id));

-- realtime
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table rsvps;
alter publication supabase_realtime add table poll_votes;
alter publication supabase_realtime add table potluck_slots;
alter publication supabase_realtime add table community_posts;
alter publication supabase_realtime add table photos;
