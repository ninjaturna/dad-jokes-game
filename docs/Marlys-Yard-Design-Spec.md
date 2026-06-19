# Marly's Yard — Design Brief for Claude Design (CD)

**Prepared by:** Cody (GIO build partner)
**Date:** June 18, 2026
**For:** Claude Design — design system, webpage themes, and logo
**Status:** Direction approved (dark-default dual theme, badge/emblem logo, four vibe concepts to explore)

---

## 1. What we're designing

**Marly's Yard** is the home for Tam's recurring weekly and monthly gatherings — an events brand and host platform under the **Black Cafe (Miami)** umbrella. The product lets a host create event pages, collect RSVPs, run date polls, message guests, and reach people by text and email. The brand needs to feel like an invitation to a place, not a SaaS dashboard.

The aesthetic anchor is the reference interior: a warm bohemian-Miami room — terracotta and oxblood walls, a wood pergola dripping with cascading vines (the literal "yard"), a teal cabinet, plum textiles, gold geometric art, a cane sofa, and a wall-sized color mural. Sophisticated, eclectic, alive. Hand-made warmth meets design confidence.

**One-line brief:** Design a badge-led brand for an intimate Miami gathering house — dark and candlelit by default, terracotta-warm in its light mode, with a garden growing through it.

CD should produce: (1) a logo system (badge/emblem), (2) a dual-theme design system with tokens, and (3) themed page layouts for the landing page, event page, RSVP flow, and host dashboard.

---

## 2. Brand directions — explore all four

We want to *see* all four personality directions rendered before locking one. Visual concepts (badge + palette + voice) have been produced alongside this brief. Each shares the same palette and badge construction but differs in surface, type, motif, and voice. CD should develop each as a distinct theme variant; we will choose after review (or blend — e.g. Soulful base with one Bold accent moment).

| # | Direction | Feeling | Type feel | Badge motif | Voice sample |
|---|-----------|---------|-----------|-------------|--------------|
| 01 | **Soulful & intimate** | Supper-club / salon, candlelit, earned-invite | High-contrast serif | Single candle flame | "a table set for the few" |
| 02 | **Bold & artistic** | Miami creative scene, mural-bright, music-forward | Heavy geometric sans | Multi-color sunburst | "where the night gets loud" |
| 03 | **Elevated & boutique** | Restrained, design-forward, the room is the hero | Refined light serif, wide tracking | Minimal line + diamond | "by design. by invitation." |
| 04 | **Warm & communal** | Backyard/garden, come-as-you-are, abundant | Friendly medium sans | Vine arch + leaves | "pull up a chair" |

**Recommendation to weigh:** Direction 01 (Soulful) as the base register matches the dark-default mood and the "earned invite" nature of a curated guest list, with Direction 04's greenery motif carried through as the connective tissue (it's the "yard"). Direction 02 is the right register for launch/social moments. Direction 03 is the safest if the brand needs to read as a premium venue.

---

## 3. Color system

Two themes ship. **Dark is the default.** Both are built from the same brand palette (pulled from the reference image via Adobe). Light mode is the warm daytime counterpart.

### Brand palette (source of truth)

| Token | Hex | RGB | Role |
|-------|-----|-----|------|
| `oxblood` | `#260306` | 38, 3, 6 | Darkest base / dark-mode page background |
| `plum` | `#590242` | 89, 2, 66 | Deep magenta — primary brand color, secondary surfaces |
| `rust` | `#733122` | 115, 49, 34 | Warm brick — light-mode anchor, surfaces |
| `red` | `#A62F24` | 166, 47, 36 | Hot brand red — alerts, energy moments |
| `terracotta` | `#D96B43` | 217, 107, 67 | Primary warm accent / CTA candidate |
| `camel` | `#A67244` | 166, 114, 68 | Gold-tan — borders, dividers, muted accent |
| `teal` | `#315955` | 49, 89, 85 | Cool counterpoint (the cabinet) — links, secondary accent |
| `greenery` | `#5DCAA5` | 93, 202, 165 | The vine — success, organic accents, motif |
| `olive` | `#403513` | 64, 53, 19 | Deep neutral, earthy shadow tone |
| `candle` | `#E0A867` | 224, 168, 103 | Warm highlight / glow (Soulful) |
| `cream` | `#FAFBF5` | 250, 251, 245 | Off-white — light-mode background, dark-mode text |

### Semantic tokens — DARK theme (default)

```
--bg-page:        #260306   (oxblood)
--bg-surface:     #3A0A12   (raised plum-oxblood)
--bg-surface-2:   #590242   (plum, for feature cards)
--text-primary:   #F2E4D6   (cream — 15.3:1 on bg, AAA)
--text-secondary: #D8C7B6   (muted cream)
--text-muted:     #A67244   (camel — 4.66:1 on bg, AA)
--accent:         #D96B43   (terracotta — primary CTA, 5.59:1 on bg, AA)
--accent-2:       #5DCAA5   (greenery — links/highlights)
--border:         #5A3326   (warm hairline)
--danger:         #A62F24
--success:        #5DCAA5
```

### Semantic tokens — LIGHT theme

```
--bg-page:        #FAFBF5   (cream)
--bg-surface:     #FFFFFF
--bg-surface-2:   #F3E9E0   (warm sand)
--text-primary:   #260306   (oxblood — 18.4:1, AAA)
--text-secondary: #733122   (rust — 9.2:1, AAA)
--text-muted:     #59443a
--accent:         #A62F24   (use red, not terracotta, for CTA text legibility on light)
--accent-2:       #315955   (teal for links)
--border:         #E4D7CB
--danger:         #A62F24
--success:        #315955
```

### Accessibility guardrails (verified)

These pairings were contrast-checked. CD must respect them:

- **Pass for body text:** cream on oxblood (15.3:1), white on plum (13.3:1), cream on rust (8.5:1), oxblood on cream (18.4:1), rust on cream (9.2:1).
- **Large text / UI only (≥24px or ≥19px bold, 3:1–4.5:1):** terracotta on plum (4.06:1), terracotta on cream (3.29:1), camel on cream (3.95:1). Never use these for body copy.
- **Do not use:** camel `#A67244` as text on rust `#733122` (2.33:1 — fails). Use cream or greenery instead.
- Terracotta is the dark-mode CTA color but switches to **red `#A62F24`** for accent text on light surfaces.

---

## 4. Typography

Pick per direction; ship a default pairing that works across the system.

- **Default (recommended):** a high-contrast display serif for headings (e.g. Fraunces, Canela, or Reckless feel) + a clean humanist sans for body (e.g. Inter, Söhne, or system sans). The serif carries the "salon" warmth; the sans keeps RSVP/forms legible.
- **Direction 01 Soulful:** display serif, generous, italic accents for taglines.
- **Direction 02 Bold:** heavy geometric/grotesque sans (800 weight) for headlines, set tight and large.
- **Direction 03 Elevated:** light serif, wide letter-spacing (`.12–.16em`), lots of air.
- **Direction 04 Warm:** rounded medium-weight sans, friendly, approachable.

Set the wordmark "MARLY'S / YARD" with wide tracking (`.22em`) per the badge. Numerals (dates, times, RSVP counts) should use the body sans with tabular figures.

---

## 5. Logo — badge / emblem (chosen direction)

A circular **crest**, venue-style. Construction:

- **Ring:** one or two concentric circles. Stroke weight expresses the vibe (thin 0.75px for Elevated, bold 2px for Bold).
- **Framing text:** small tracked caps at top (`· MIAMI ·` or `EST · 2026`); the stacked wordmark `MARLY'S` over `YARD` in the center.
- **Central motif:** one per direction — candle flame (Soulful), sunburst (Bold), line+diamond (Elevated), vine arch with leaves (Warm). The **vine** is the recommended unifying mark since it *is* the yard.
- **Lockups to deliver:**
  1. Primary badge (full crest, circular).
  2. Horizontal wordmark lockup (motif + "Marly's Yard") for site headers and email.
  3. App icon / favicon — motif only inside the ring, legible at 32px.
  4. Single-color (cream) and reversed (on terracotta/plum) versions.
- **Clear space:** minimum half the ring diameter on all sides.
- **Don'ts:** no gradients in the mark, no drop shadows, don't stretch the ring, don't place the badge on a busy photo without a scrim, don't recolor the motif outside the palette.

Note: the existing `public/root.html` placeholder uses the **Bangers** display font and a yellow accent (`#FFE500`). That is *not* the Marly's Yard brand — it's leftover from the Dad Jokes game and should be retired. Marly's Yard yellow, if any, is the warmer `candle #E0A867`, never neon.

---

## 6. Page themes to design

Dark-default. Each page should be delivered in both themes.

1. **Landing / "the Yard"** — hero with the badge, a single line of voice copy, an atmospheric image treatment (warm low light, greenery), and one CTA ("See what's coming" / "Get on the list"). Below: upcoming gatherings, what Marly's Yard is, how to get invited.
2. **Event page** — the hero of the product. Photo/oxblood background, event title in display serif, date/time/location, host note, RSVP module, guest count, "add to calendar," map link. Must feel like a printed invitation rendered for the screen.
3. **RSVP flow** — frictionless, no account required. Name + yes/no/maybe + optional plus-ones. Big tap targets, warm confirmation state ("You're in. See you in the yard.").
4. **Host dashboard** — calmer, more utilitarian, but still on-brand. Event list, RSVP status at a glance, quick actions (message guests, edit, new event). This is where the sans does the heavy lifting.

---

## 7. Components & tokens

The brand is warm and hand-made — lean **soft and organic**, the opposite of hard corporate brutalism.

- **Corners:** generous radii — `12px` cards, `8px` inputs/buttons, pill-shaped tags and RSVP buttons.
- **Borders:** 1px warm hairlines (`--border`), used sparingly. Let surface contrast do the work.
- **Shadows:** soft and low — `0 8px 24px rgba(20,2,4,0.35)` in dark mode for raised cards. (This brand *does* use soft shadows; that GIO rule is product-specific to GIO Validate, not Marly's Yard.)
- **Buttons:** primary = terracotta fill, cream text (dark) / red fill, cream text (light). Secondary = outline in camel. Generous padding, rounded.
- **Cards:** plum or raised-oxblood surface, soft shadow, optional thin camel top accent.
- **Imagery:** warm, golden-hour, plenty of greenery and texture; apply a subtle oxblood scrim/overlay so text stays legible and the palette stays cohesive. Murals and color can appear as accent crops, not full backgrounds.
- **Texture:** a faint paper/plaster grain on large flat surfaces is welcome (it echoes the textured walls in the reference) — keep it subtle, never noisy.
- **Motion:** slow, warm fades and reveals (the codebase already has a `useScrollReveal` hook). Nothing snappy or techy.

---

## 8. Deliverables checklist for CD

- [ ] Logo badge system — 4 motif variants, then 1 chosen; full lockup set (primary, horizontal, app icon, mono, reversed)
- [ ] Color tokens — dark + light, as design variables matching Section 3
- [ ] Type scale and font pairing (default + per-direction notes)
- [ ] Component library — buttons, inputs, cards, tags, RSVP module, nav
- [ ] Four page themes — landing, event page, RSVP, host dashboard — in both modes
- [ ] One worked example of each of the four vibe directions applied to the event page hero, so we can choose

---

## 9. Technical notes (for implementation handoff, not CD)

Built on the GIO stack: React 19 + TypeScript + Vite, Tailwind v3 (npm, not CDN), Supabase, Vercel, SendGrid (email), Twilio (text, Phase 2). Tokens should be exportable as Tailwind theme values and CSS variables. The repo currently hosts the Dad Jokes game and will be repurposed/renamed to Marly's Yard; the existing landing-page component and design (Bangers font, neon yellow) is to be replaced, not extended.
