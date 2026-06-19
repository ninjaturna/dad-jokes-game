# Marly's Yard — Build Roadmap

**Owner:** Tam · **Build partner:** Cody · **Executor:** Claude Code (CC)
**Date:** June 18, 2026
**Source of truth:** `handoff 2/README.md` + `handoff 2/tokens.css` + `handoff 2/tailwind.config.js` + `handoff 2/prototypes/*.dc.html` + `handoff 2/screens/*.png`
**Build mode:** High-fidelity recreation. `handoff 2/` contains all 16 `.dc.html` prototypes + `support.js` and a PNG render of every screen. CC recreates each screen as real React components — using the prototypes for structure/interaction and the PNGs as the visual target — wired to the token files. Do NOT embed the prototype HTML; rebuild as components.

**Housekeeping:** two handoff folders now exist — `handoff/` (partial, earlier) and `handoff 2/` (complete). Consolidate to one canonical `handoff/` before CC-1 so there's a single source of truth.

## Principle
One CC instruction per step. Each step ships, gets verified against its test gate, and gets committed before the next begins. No bundling — a step that breaks must be debuggable and revertable on its own.

## Stack
React 19 + TypeScript + Vite · Tailwind v3 (npm) · Supabase (data/auth/realtime) · Vercel · SendGrid (email) · Twilio (SMS, Phase 2) · Stripe (ticketing, Phase 2). Existing repo: the Dad Jokes game, being repurposed. The Dad Jokes game is **preserved as an event asset** under a new `/games` section (guests play it at gatherings); its components and Supabase tables stay. Only the Dad Jokes *coming-soon* page (`public/root.html`) and the single-app subpath deploy are retired.

## Proposed route map (replaces dad-jokes routes)
```
/                     Landing — "the Yard"
/e/:slug              Event Page (public, shortlink target, RSVP w/o account)
/e/:slug/rsvp         RSVP Flow (or inline on event page)
/host                 Host Dashboard (auth)
/host/create          Create Event
/host/event/:id       Manage Event
/host/guests          Guests
/host/invites/:id     Send Invites
/community/:id        Community
/games                Games hub (event assets guests can play)
/games/:slug          A playable game — Dad Jokes stays at /games/canyoukeepastraightface for link continuity
/index                Screen directory hub (dev/nav)
```

---

## The 8 steps

### CC-1 · Foundation  *(MVP)*
**Goal:** Brand + theming skeleton in place; project is "Marly's Yard," not "dad-jokes."
**Scope (in):** rename `package.json` name + `README.md` + `index.html` `<title>`; add Archivo + Hanken Grotesk `<link>` to `index.html`; paste `tokens.css` into `src/index.css`; replace `tailwind.config.js` with the handoff version; add an app shell with `data-theme` on `<html>` + a theme-toggle hook/util (default dark); delete `public/root.html` and its Bangers/neon styling.
**Scope (out):** any screen content, Supabase, the crest.
**Files:** `package.json`, `README.md`, `index.html`, `src/index.css`, `tailwind.config.js`, `src/App.tsx` (shell only), new `src/lib/theme.ts`, remove `public/root.html`.
**Depends on:** nothing.
**Test gate:** `npm run dev` boots; toggling theme flips `data-theme` and all token-driven colors transition; fonts load (Archivo/Hanken visible); no console errors.
**Watch for:** UTF-8 on any file with special chars; keep Tailwind v3 as npm (no CDN); don't break the existing Vite build script (`tsc -b && vite build && post-build.mjs`); `darkMode: ['class','[data-theme="dark"]']` must match the toggle.

### CC-2 · Crest brand mark
**Goal:** The reusable vine crest, used by every screen.
**Scope (in):** `<Crest>` React component, code-drawn SVG, props per README (`size`, ring/ink/accent/vine/leaf colors, top text, `ringWidth`, double rings, `showWord`); horizontal lockup variant; motif-only app icon export → `favicon`/PWA icon.
**Files:** `src/components/brand/Crest.tsx`, favicon assets, `index.html` favicon link.
**Depends on:** CC-1 (tokens).
**Test gate:** Crest renders crisp at 32px (icon) through hero size; recolors via props; legible in both themes; no gradients/shadows in the mark.
**Watch for:** keep vine on-palette (greenery `#5DCAA5`, leaves olive/teal); don't rasterize — stay SVG.

### CC-3 · Supabase schema rebuild
**Goal:** Data layer for the whole product.
**Scope (in):** new tables — `events`, `rsvps`, `guests`, `lists`, `list_members`, `polls`, `poll_votes`, `potluck_slots`, `info_pages`, `community_posts`, `photos`, `playlist_tracks`, `tickets`/`ticket_tiers` (Phase 2 cols ok, unused until then); RLS on every table; realtime where needed (RSVPs, polls, community). **Keep the existing dad-jokes tables** — the game still runs on them; add Marly's Yard tables alongside.
**Files:** new `marlys-yard-supabase-schema.sql`; `src/lib/supabase.ts` stays; regenerate types.
**Depends on:** CC-1.
**Test gate:** schema applies clean; RLS enabled on all (Security Advisor clean); a test event + RSVP round-trips.
**Watch for:** run SQL statements individually (not as one block); UUIDs without brackets; `ALTER PUBLICATION supabase_realtime ADD TABLE ...` for realtime tables; create tables before adding circular FKs; no-account RSVP means anon INSERT **and UPDATE** policies on `rsvps` scoped to a published event (UPDATE is required so guests can change their response — added during CC-4, mirrors the `potluck_claim` pattern).

### CC-4 · Core guest flow  *(MVP — the thing that must work)*
**Goal:** A guest opens a shortlink and RSVPs with no account.
**Scope (in):** Event Page (centered 600px invitation: crest, eyebrow, image w/ scrim + seats-left badge, title, when/where grid, host note, RSVP module, guest avatars, bring/wear, calendar/map/share); RSVP Flow (3-step, Yes/Maybe/Can't, name + plus-ones, response-specific confirmation); shortlink routing → Event Page; `.ics` generation (`America/New_York`); wire to Supabase.
**Files:** `src/pages/EventPage.tsx`, `src/components/rsvp/*`, `src/lib/ics.ts`, route updates in `App.tsx`.
**Depends on:** CC-2, CC-3.
**Test gate:** open `/e/:slug` cold (no auth) → RSVP Yes/Maybe/No persists to Supabase → correct confirmation; plus-one stepper clamps; add-to-calendar downloads a valid `.ics`; realtime guest count updates.
**Watch for:** RSVP must gate on a selection; confirmation copy varies by choice; mobile tap targets ≥44px; anon RLS policy from CC-3.

### CC-G · Games section (event assets)
**Goal:** Preserve the Dad Jokes game and make games a first-class event asset — guests play them at gatherings.
**Scope (in):** a `/games` hub page (Marly's-Yard-branded card grid of available games); re-home the existing Dad Jokes app under `/games/canyoukeepastraightface/*` (its internal routes — play/join/lobby/room — nested there) so existing links/QRs keep working; wrap it in the new brand shell/nav; later, an "attach game to event" hook so a game can be linked from an Event Page / Info Page. Keep the existing dad-jokes Supabase tables and game logic untouched; only re-route and re-skin the shell.
**Scope (out):** rewriting game internals; new games (future).
**Files:** `src/pages/games/GamesHub.tsx`, move game components into `src/games/dad-jokes/`, nested `<Routes>` in `App.tsx`.
**Depends on:** CC-1 (only). Can run in parallel with CC-2/CC-3/CC-4.
**Test gate:** `/games` lists Dad Jokes; `/games/canyoukeepastraightface` boots and a full game round still works (create → join → play); brand nav present; no regression in game logic.
**Watch for:** preserve the exact existing slug for link continuity; the game's realtime/Supabase tables must remain in place (do not let CC-3 drop them); keep game-specific styles scoped so they don't fight the brand tokens.

### CC-5 · Landing + Index
**Goal:** Public front door + dev nav hub.
**Scope (in):** Landing "the Yard" (sticky nav w/ horizontal lockup + theme toggle; atmospheric hero stays dark in both themes; upcoming-gatherings grid → Event Page; "what this is" editorial; get-on-the-list capture; footer); Index directory hub.
**Files:** `src/pages/Landing.tsx`, `src/pages/Index.tsx`.
**Depends on:** CC-4 (links to live event pages).
**Test gate:** hero renders atmospheric in light + dark; upcoming gatherings pull real events; capture form submits; scroll reveals fire (reuse `useScrollReveal`).
**Watch for:** hero must not invert to light — it's intentionally dark always.

### CC-6 · Host tools
**Goal:** Tam can create and manage gatherings.
**Scope (in):** Host Dashboard (rail nav, greeting, stat cards, event rows w/ RSVP breakdown bar, message/edit, recently-passed); Create Event (form: basics, series/tag pills, guest-book picker w/ import-from-contacts + select-all + count, plus-ones toggle/max, audience, auto-polls dietary+date+potluck, info-page chips, links, parking; live invitation preview + auto-slug shortlink w/ copy); Manage Event (edit w/ "Notify N guests" dirty banner, date-poll results + lock-in, potluck claim/unclaim, add-to-calendar).
**Files:** `src/pages/host/{Dashboard,CreateEvent,ManageEvent}.tsx`, supporting components.
**Depends on:** CC-4.
**Test gate:** create an event end-to-end → appears on dashboard + landing; edit → notify banner only when dirty; date poll tallies + locks; potluck slots claim/unclaim live.
**Watch for:** auth/RLS — host-only actions; shortlink uniqueness; series/recurring is just metadata here (full recurrence is CC-8).

### CC-7 · Invites (email + QR)
**Goal:** Reach guests by email; manage lists; approve requests.
**Scope (in):** Guests (Lists / All contacts / Pending-approval tabs; add-to-list sheet; invite-this-list; approve/deny w/ badge count); Send Invites (Email channel via SendGrid; design picker Candlelit/Mural/Garden; recipient lists w/ headcount; live email preview; event QR via `qrcode` → shortlink; delivery stats). SMS channel UI present but disabled until CC-8.
**Files:** `src/pages/host/{Guests,SendInvites}.tsx`, SendGrid edge function, QR util.
**Depends on:** CC-6.
**Test gate:** create a list, send a real test email through SendGrid, QR resolves to the event shortlink, pending approve/deny updates RSVP state.
**Watch for:** SendGrid API key as a Vercel env var (server-side, not `VITE_`); use the real `qrcode` package (replace the canvas mock from the prototype); rate/spam considerations.

### CC-8 · Phase 2
**Goal:** The depth features, once the core loop is proven.
**Scope (in), each its own sub-instruction:**
- **Info Pages** — attach Itinerary/Menu/Track list/Games/Custom; phone preview per type.
- **Community** — feed/composer/pins, photo grid (guest upload → Supabase storage), shared playlist.
- **Settings** — automated reminders (schedule + nudge non-responders), recurring events (cadence + auto-publish), privacy (visibility + guest-list + let-guests-invite), per-type notification matrix.
- **Ticketing** — paid toggle, tiers, fees (2.9% + $0.30/ticket), checkout, Stripe payouts.
- **Video Invites** — record (idle→recording 30s cap→playback), caption, send.
- **SMS** — enable the Send Invites SMS channel via Twilio.
**Depends on:** CC-7.
**Test gate:** per sub-feature.
**Watch for:** **SMS needs Twilio + A2P 10DLC carrier registration — start that paperwork early, it has lead time.** Stripe webhook handler needs `export const config = { api: { bodyParser: false } }`; promo codes need a Promotion Code object; do NOT use Cal.com-native Stripe. Photo upload = Supabase storage bucket + policies.

---

## Sequencing notes
- **MVP = CC-1 → CC-4.** That's a guest opening a link and RSVPing, on-brand, themed. Everything after is host power + reach + depth.
- CC-2 and CC-3 can run in parallel after CC-1 (both only depend on foundation).
- Commit + Vercel-check after every step (`git pull` first on any device — Drive ≠ GitHub).
- Each CC instruction will carry: context, implementation order, file targets, full code, test scenarios, and a Watch-For. Say `GA` on a step and I generate it.
