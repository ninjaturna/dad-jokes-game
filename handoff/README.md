# Handoff: Marly's Yard — Events & Host Platform

## Overview
**Marly's Yard** is an events brand and host platform under the **Black Cafe (Miami)** umbrella — the home for Tam's recurring weekly/monthly gatherings. Hosts create event pages, collect RSVPs, run polls, manage guests, and reach people by email/text. The product should feel like *an invitation to a place*, not a SaaS dashboard: warm, bohemian-Miami, candlelit.

This bundle is the full design system + ~15 screens covering the brand, the guest experience, and the host tools.

## What's in this folder
- **`README.md`** — this guide.
- **`tailwind.config.js`** + **`tokens.css`** — drop-in design tokens.
- **`screens/`** — dark-mode PNG of every screen (the pixel target). Numbered to match the Screens list below.
- **`prototypes/`** — the live `*.dc.html` prototypes + `support.js`. Open any in a browser to see real interaction (RSVP, steppers, polls, recorder, theme toggle). Rebuild as React — don't embed.

### Screens index (`screens/`)
`01-Index` · `02-Landing` · `03-Event-Page` · `04-RSVP-Flow` · `05-Host-Dashboard` · `06-Create-Event` · `07-Manage-Event` · `08-Guests` · `09-Send-Invites` · `10-Info-Pages` · `11-Community` · `12-Settings` · `13-Ticketing` · `14-Video-Invites` · `15-Design-System` · `16-Crest`

> Screenshots are dark theme (the default) at desktop width; the prototypes carry the light theme + responsive behavior.

## About the Design Files
The files referenced here are **design references created in HTML** — streaming "Design Components" (`*.dc.html`) that demonstrate the intended look, content, and interaction. **They are not production code to copy verbatim.** The task is to **recreate these designs in the target codebase** (GIO stack: React 19 + TypeScript + Vite + Tailwind v3 + Supabase) using its established patterns, components, and data layer. The `.dc.html` files use an internal runtime (`support.js`) and inline styles for live-preview reasons; in the real app, use the token files below + Tailwind + real React components.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, shadows, and interaction states are all specified. Recreate the UI faithfully using the codebase's libraries. Exact hex values and the token mapping are in `tailwind.config.js` and `tokens.css` (both in this folder) and summarized below.

---

## Design Tokens

### Brand palette (source of truth)
| Token | Hex | Role |
|---|---|---|
| oxblood | `#260306` | darkest base / dark page bg |
| plum | `#590242` | primary brand, feature surfaces |
| rust | `#733122` | warm brick, light-mode anchor |
| red | `#A62F24` | hot red — alerts, light-mode CTA text |
| terracotta | `#D96B43` | primary warm accent / dark CTA |
| camel | `#A67244` | borders, muted accent |
| teal | `#315955` | cool counterpoint, light-mode links |
| greenery | `#5DCAA5` | the vine — success, organic accents |
| olive | `#403513` | deep earthy shadow tone |
| candle | `#E0A867` | warm glow / highlight |
| cream | `#FAFBF5` | off-white, light bg / dark text |

### Semantic tokens — DARK (default)
`--bg-page:#260306` · `--bg-surface:#3A0A12` · `--bg-surface-2:#590242` · `--text-primary:#F2E4D6` · `--text-secondary:#D8C7B6` · `--text-muted:#A67244` (UI labels often use a brighter camel `#C98A4E`) · `--accent:#D96B43` · `--accent-2:#5DCAA5` · `--border:#5A3326` · `--danger:#A62F24` · `--success:#5DCAA5`

### Semantic tokens — LIGHT
`--bg-page:#FAFBF5` (app shells use a warmer `#F5EFE7`) · `--bg-surface:#FFFFFF` · `--bg-surface-2:#F3E9E0` · `--text-primary:#260306` · `--text-secondary:#733122` · `--text-muted:#8A6A4A` · `--accent:#A62F24` (red, for legibility) · `--accent-2:#315955` (teal) · `--border:#E4D7CB`

Theme is switched by setting `data-theme="light"` on a wrapper (or `<html>`). Dark is the default (`:root`). Full definitions: **`tokens.css`**. Tailwind mapping: **`tailwind.config.js`**.

### Typography
- **Display:** `Archivo` (Google Fonts, 300–900). Two registers:
  - *Bold:* weight 800–900, tight tracking (`-.02em`), large.
  - *Elevated:* weight 300, wide tracking (`.12–.14em`), uppercase.
- **Body/UI:** `Hanken Grotesk` (300–700). Use `tabular-nums` for dates, times, counts, money.
- Wordmark lockup: **BLACK CAFE** (primary) + **@ MARLY'S YARD** (location, muted). Crest carries it as BLACK CAFE (ring top) → vine → MARLY'S / YARD. Archivo, letter-spacing `.14–.18em`. Domain: **blackcafe.miami**.
- Scale: Display 48–72 / H1 36–44 / H2 28–32 / H3 22 / Body 16–18 / Label 12 (uppercase, `.22–.28em`).

### Spacing / shape
- Radii: cards `12–14px`, inputs/buttons `8–10px`, pills/RSVP `999px`.
- Borders: `1px` warm hairline (`--border`), used sparingly.
- Shadows (soft, low): dark `0 12px 30px rgba(12,1,3,.5)`; light `0 12px 28px rgba(38,3,6,.10)`.
- Texture: faint fractal-noise grain overlay (`opacity ~.05`, `mix-blend:overlay`) on large surfaces; candlelit radial glow behind heroes.
- Tap targets ≥ 44px.

### Accessibility guardrails (verified)
Body-text safe: cream/oxblood 15.3:1, white/plum 13.3:1, cream/rust 8.5:1, oxblood/cream 18.4:1, rust/cream 9.2:1. Large-text/UI only (3–4.5:1): terracotta/plum, terracotta/cream, camel/cream — never body. **Never** camel on rust (2.33:1). Terracotta is the dark CTA; switch to **red `#A62F24`** for accent text on light.

---

## The brand mark (Crest)
A circular venue crest: one or two concentric rings, tracked caps top (`· MIAMI ·` / `EST · 2026`), stacked wordmark `MARLY'S` over `YARD`, and a **vine arch + leaves** motif (greenery `#5DCAA5` arch with olive/teal leaves) — the unifying mark, since it *is* the yard. Lockups: primary badge, motif-only app icon (legible at 32px), horizontal lockup, single-color cream, reversed on terracotta. No gradients/shadows in the mark; don't recolor the vine off-palette. Reference: `Crest.dc.html`.

---

## Screens / Views

Brand register: **Elevated base with bold accents** (and a bold-base/elevated-polish variant) — sans-serif throughout. All screens are dark-default with a light toggle.

1. **Index** (`Index.dc.html`) — directory hub linking every screen, grouped Guest-facing / Host tools / Community / Foundation. Crest header, grain + glow, card grid (`minmax(232px,1fr)`).

2. **Landing / "the Yard"** (`Landing.dc.html`) — sticky nav (horizontal lockup + links + theme toggle); full-bleed atmospheric hero (striped oxblood + candle radial) with crest, elevated/bold headline, two CTAs; "Upcoming gatherings" card grid (links to Event Page); "What this is" two-column editorial; "Get on the list" capture; footer. Hero stays dark/atmospheric in both themes.

3. **Event Page** (`Event Page.dc.html`) — centered 600px invitation column: crest, eyebrow, event image (scrim + "3 seats left" badge), display title, when/where meta grid, host note card, **interactive RSVP module** (name, Yes/Maybe/Can't segmented, plus-one stepper, submit → confirmation "You're in. See you in the yard."), guest avatars, bring/wear details, calendar/map/share links.

4. **RSVP Flow** (`RSVP Flow.dc.html`) — frictionless, no account. Centered card, 3-step progress: (1) Yes/Maybe/Can't big tap targets, (2) name + plus-ones, (3) warm confirmation (varies by response). Crest confirmation, add-to-calendar.

5. **Host Dashboard** (`Host Dashboard.dc.html`) — left rail (logo, nav, theme toggle, profile); main: greeting, "New gathering" (→ Create Event), 4 stat cards, event rows with date chip + RSVP breakdown bar (going/maybe/declined) + Message/Edit, "recently passed" list.

6. **Create Event** (`Create Event.dc.html`) — two columns: form (basics; series/tag pills; Guest Book picker w/ "Import from Contacts" + select-all + invited count; plus-ones toggle+max; audience All/Kid-friendly/Adults; "Ask the table" auto-polls = dietary + date poll + **potluck sign-up**; **Info pages** add chips → Itinerary/Menu/Track list/Games/Custom; links rows; parking) and a **live invitation preview** + auto-slugged **shortlink** with copy.

7. **Manage Event** (`Manage Event.dc.html`) — edit details with a "Notify N guests" save banner (only when dirty); **date-poll results** (vote bars, leading/locked badge, lock-in); **potluck sign-up** (claim/unclaim slots, add slot); **add-to-calendar** (.ics / Google / Outlook).

8. **Guests** (`Guests.dc.html`) — tabs Lists / All contacts / Pending. Lists: cards w/ member avatars + "Invite this list" + add-to-list sheet (modal picker). All contacts: rows with list-membership chips. Pending: approve/deny RSVP requests from shared links (badge count updates).

9. **Send Invites** (`Send Invites.dc.html`) — Email/SMS channel toggle; **invitation design picker** (Candlelit / Mural / Garden); recipient **lists** with running headcount; **live email + SMS previews**; generated **event QR** (drawn on canvas w/ finder patterns); send → delivery stats.

10. **Info Pages** (`Info Pages.dc.html`) — attach extra invite pages. Left: page cards + add-type buttons + per-row editor (type-specific labels). Right: phone preview rendering each type distinctly — Itinerary (timeline), Menu (centered courses), Track list (numbered), Games (cards), Custom (heading/body).

11. **Community** (`Community.dc.html`) — persistent members hub. Banner w/ crest + member count. Tabs: **Feed** (composer, posts, like, pinned announcements), **Photos** (guest-upload grid + drop tile), **Playlist** (now-playing bar, add-track, numbered tracks w/ contributor avatars).

12. **Ticketing** (`Ticketing.dc.html`) — enable-paid toggle; editable ticket tiers (name/price/qty); pass-fees + pay-what-you-can options; **live guest checkout** (tier steppers, subtotal/fee/total, fee = 2.9% + $0.30/ticket, pay button) + payout note.

13. **Video Invites** (`Video Invites.dc.html`) — record a welcome. Camera viewport state machine **idle → recording (live timer, blinking REC, 30s cap) → recorded (playback w/ scrubber, retake/use)**; caption; phone-style invite preview with "FROM TAM" video card (play overlay + event details) and send.

14. **Settings** (`Settings.dc.html`) — automated reminders (schedule chips + nudge non-responders); recurring events (cadence segmented + auto-publish); privacy (visibility radio Private/Unlisted/Public + show-guest-list + let-guests-invite); per-type notification matrix (email/text per New RSVP, Comments, Poll results, Photos).

15. **Design System** (`Marlys Yard Design System.dc.html`) — the spec: logo lockups, brand palette + dark/light semantic tokens, type scale, two registers, component library (buttons, inputs, tags, cards, RSVP module). **Crest** (`Crest.dc.html`) — reusable badge component (props: size, ring/ink/accent/vine/leaf colors, top text, ringWidth, double rings, showWord).

---

## Interactions & Behavior
- **Theme toggle:** flips `data-theme`; CSS-variable tokens cascade; `transition: background .5s, color .5s`.
- **RSVP:** selection recolors segmented buttons (greenery/candle/red tints); submit gates on a selection; confirmation copy varies by Yes/Maybe/No.
- **Steppers** (plus-ones, tickets, potluck) clamp at sensible min/max; totals/counts recompute live.
- **Toggles:** pill switches (knob slides `3px↔25px`), checkbox-squares for multi-select.
- **Modals/sheets:** overlay click closes; inner click stops propagation.
- **Video recorder:** `setInterval` drives the record timer (auto-stops at 30s) and playback scrubber; clear intervals on unmount/retake.
- **QR:** drawn on `<canvas>` (deterministic module grid + 3 finder patterns) — replace with a real QR encoder (e.g. `qrcode`) pointing at the event shortlink.
- **Copy link / send:** transient confirmed state (~1.6s) then revert.
- **Motion:** slow warm fades/reveals (repo already has a `useScrollReveal` hook). Nothing snappy/techy.

## State Management (per screen, illustrative)
RSVP: `{name, plus, choice, sent}`. Create Event: `{title,date,time,place,category,plusAllowed,plusMax,audience,guests[],links[],polls{diet,date,potluck},infoPages[],parking}`. Guests: `{tab, contacts[], lists[], pending[], addListId}`. Send Invites: `{channel, template, lists[].sel, note, sent}`. Manage: `{fields, dirty, notify, pollLocked, slots[]}`. Ticketing: `{enabled, tiers[], passFees, pwyc}`. Video: `{status, sec, playing, playSec, caption}`. In production back these with Supabase + the data layer; RSVPs and approvals are server-persisted.

## Data / Integrations (from brief)
Supabase (data/auth), SendGrid (email invites), Twilio (SMS, Phase 2), Stripe (ticketing payouts), Vercel (hosting). Shortlinks resolve to the public Event Page (RSVP without an account). `.ics` generation in `America/New_York`.

## Assets
- **Fonts:** Archivo + Hanken Grotesk via Google Fonts (`<link>` snippet at top of `tokens.css`).
- **Logo:** the Crest is code-drawn SVG (no raster needed); export app icon/favicon from the motif-only lockup.
- **Imagery:** placeholders only in the mocks (striped fills + monospace captions). Replace with warm golden-hour photos w/ a subtle oxblood scrim; greenery/texture forward. No real photos are bundled.
- ⚠️ Retire the old `public/root.html` (Dad Jokes — Bangers font, neon `#FFE500`); not part of this brand.

## Files
Token files in this folder:
- `tailwind.config.js` — brand colors, semantic colors (CSS-var-backed), fonts, radii, shadows.
- `tokens.css` — `:root` (dark) + `[data-theme="light"]` variables, base resets, font `<link>` snippet, `.tabular` helper.

Design reference prototypes (project root): `Index.dc.html`, `Landing.dc.html`, `Event Page.dc.html`, `RSVP Flow.dc.html`, `Host Dashboard.dc.html`, `Create Event.dc.html`, `Manage Event.dc.html`, `Guests.dc.html`, `Send Invites.dc.html`, `Info Pages.dc.html`, `Community.dc.html`, `Settings.dc.html`, `Ticketing.dc.html`, `Video Invites.dc.html`, `Marlys Yard Design System.dc.html`, `Crest.dc.html`.

> Implementation note: a developer can open any `.dc.html` in a browser to see the intended behavior, but should rebuild each as real React components using the tokens here — not embed the HTML.
