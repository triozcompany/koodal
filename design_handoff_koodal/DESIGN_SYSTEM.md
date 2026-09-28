# Koodal Design System

Koodal's own system, used by both **Koodal Citizen** and **Koodal Government**. It is **not** the TrainerCentral / Zoho system. Every value below was pulled from the prototypes. `tokens.css` has them as CSS variables: section 1 is copied verbatim from the prototype, and section 3 gives the scales names.

**Rule:** build these components once (phase 1) in `components/ui/`, then every screen uses them. Don't restyle them per screen. If a slice's markup differs slightly from a component, add a prop/variant that matches the markup exactly.

---

## 1. Foundations

### Colour: roles
All colours are `--cp-*` variables themed by `[data-cp-theme="light"|"dark"]`. Components never use raw hex, except where the prototype does: the always-dark rail uses `#000`, `#141414` and `#262626`.

| Role | Token | Used for |
|---|---|---|
| Ink | `--cp-ink` / `-ink-2` / `-ink-3` | text primary / secondary / muted; **primary button fill** |
| Surfaces | `--cp-bg`, `--cp-surface`, `--cp-surface-2` | page, cards, fills (icon buttons, segmented tracks) |
| Lines | `--cp-line` (borders), `--cp-edge` (raised-button bottom edge) | |
| **Pulse (orange)** | `--cp-pulse`, `-deep`, `-soft` | brand accent, *In progress*, critical/high severity, FAB glow |
| **Marigold (yellow)** | `--cp-marigold`, `-soft`, `--cp-on-marigold` | *Gathering support* / *Pending approval*, medium severity |
| **Peacock (teal)** | `--cp-peacock`, `-soft` | *Official case* / *Assigned*, *With govt* (soft) |
| **Leaf (green)** | `--cp-leaf`, `-soft` | *Fixed · confirm* (soft), *Closed*, success toast icon |
| Map | `--cp-map`, `-line`, `-road`, `-park`, `-water` | drawn map + Google Maps styling |
| Placeholders | `--cp-ph-a` / `-b` | striped photo placeholders `repeating-linear-gradient(135deg, …)` |
| Scrim | `--cp-scrim` | behind sheets/modals |

### Stage → colour (single source, use everywhere)
**Citizen `PILL`** — `[background, text, label]`
- reported → `surface-2` / `ink-2` · **New**
- community → `marigold` / `on-marigold` · **Gathering support**
- review → `peacock-soft` / `ink` · **With govt**
- verified, assigned → `peacock` / `#fff` · **Official case**
- progress → `pulse` / `#fff` · **In progress**
- resolved → `leaf-soft` / `ink` · **Fixed · confirm**
- closed → `leaf` / `#fff` · **Closed**
- rejected → `surface-2` / `ink-3` · **Not accepted**

**Government `GS`** — `[label, bg, fg, icon]`
- pending → Pending approval · `marigold` / `on-marigold` · `ph-hourglass-medium`
- assigned → Assigned · `peacock` / `#fff` · `ph-user-circle-check`
- progress → In progress · `pulse` / `#fff` · `ph-hard-hat`
- reopened → Reopened · `pulse-soft` / `pulse-deep` · `ph-arrow-counter-clockwise`
- fixed → Fixed · confirming · `leaf-soft` / `ink` · `ph-check`
- closed → Closed · `leaf` / `#fff` · `ph-seal-check`
- rejected → Rejected · `surface-2` / `ink-3` · `ph-x-circle`

**Severity `SEVL`**: critical "Critical" & high "High risk" → `pulse-soft` (text `pulse-deep`); medium → `marigold-soft`; low → `surface-2`.

**Progress track** (5 segments `12×4px`, radius 2, gap 3): colours `ink-3 → marigold → peacock → pulse → leaf`. Steps: Reported (`ph-flag`), Community (`ph-users-three`), Verified (`ph-seal-check`), Action (`ph-hard-hat`), Fixed (`ph-check`).

Put these maps in `lib/domain/stage-style.ts` and import them. Never re-type them.

### Typography
Fonts are **Outfit** (UI), **DM Serif Display** (display headings), and **Noto Sans Tamil** (Tamil fallback on body text). Styles are written as the `font:` shorthand, e.g. `font:600 12px/1 Outfit,sans-serif`. Keep that form.

| Role | Value | Notes |
|---|---|---|
| Display XL | `400 52px/1` DM Serif, `-.03em` | gov login hero |
| Display L | `400 34px/1.05` DM Serif, `-.03em` | page H1 |
| Display M | `400 23px/1` DM Serif, `-.02em` | sheet / section titles ("Nearby") |
| Display S | `400 20–22px/1.1` DM Serif | card headings, gov KPIs |
| Title | `600 16px/1.25` Outfit | row titles, modal titles |
| Body | `500 13px/1.4` Outfit + Noto Sans Tamil | descriptions, notes |
| Body S | `500 12px/1.3` | meta lines |
| Button L | `600 15px/1` `.01em` | primary CTA |
| Button | `600 13px/1` | standard buttons |
| Chip | `600 12px/1` | chips, filters |
| Pill | `600 11.5px/1` | status pills |
| Label | `600 11px/1`, `.16em`, UPPERCASE, `ink-3` | section/field labels |

Most-used sizes are 11–16px for UI text, 17–20px for icons, and 23–52px for display. Line-height `1` is the default for single-line UI.

### Spacing
The scale is 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32. Most common gaps are **6, 8, 10, 4, 12, 14**. Horizontal button padding is **10–16px**. Card padding is **14px 16px** (citizen) and **18px** (gov). Desktop page padding is **22px 32px 64px**.

### Radius
- **999px**: every button, chip, pill, input on citizen, segmented control
- **50%**: icon buttons, avatars
- **20px**: cards and lists
- **16px**: gov inputs, stat tiles
- **14px**: thumbnails, tiles, toast, textareas
- **12px**: small thumbs
- **26px 26px 0 0**: mobile bottom sheet
- **2–4px**: bars and segments

### Control heights
22 (pill) · 34 (chip) · 40 (button / icon button) · 44 (large button, pill button) · 52 (primary CTA / FAB) · 54 (gov input) · 60 (support vote button).

### Elevation
- `--k-sh-primary`: dark filled buttons (drop shadow plus inner top highlight)
- `--k-sh-raised`: light "physical" buttons; a 2px bottom edge in `--cp-edge` plus a soft drop
- `--k-sh-pin`: map pins
- `--k-sh-sheet`: bottom sheet
- `--k-sh-modal`: modals
- `--k-sh-toast`: toast
- `--k-sh-fab`: orange glow under the report FAB
- **Pressed state (all buttons):** `transform: translateY(2px) scale(.985); box-shadow: 0 0 0 transparent`

### Motion
| Use | Value |
|---|---|
| Press feedback | `transform .12s` |
| Hover/colour | `background .15s`, `all .15s` |
| Springy toggles, votes, pins | `.25s cubic-bezier(.3,1.6,.5,1)` |
| Screen enter | `cp-in .35s cubic-bezier(.2,.9,.25,1.1) both` |
| List rows (staggered) | `cp-row .2–.35s ease-out both` with per-row delay |
| Bottom sheet / full-screen overlay | `cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both` |
| Toast | `cp-toast .35s cubic-bezier(.2,.9,.3,1.3) both` |
| Popover | `cp-pop2 .15–.25s both` |
| Live pin / hotspot pulse | `cp-ping 1.6–1.9s ease-out infinite` |
| Celebrations | `cp-pop`, `cp-stamp`, `cp-spark` (threshold, verify stamp) |
| Rail collapse | `width .3s cubic-bezier(.2,.9,.3,1)` |
| Ripple | `.cp-rip` on dark buttons (`data-glare="1"`), `.6s` |

Also: `navigator.vibrate(5)` on press (user-toggleable), and ripple and `::after` hidden under `prefers-reduced-motion`.

### Icons
**Phosphor 2.1.1**, `bold` for UI and `fill` for status/emphasis. Icon size inside buttons is 13–20px.

---

## 2. Components (build once in `components/ui/`)

Each spec is copied from the prototype markup. Keep the values exactly.

**Button: primary** (`variant="primary"`)
`height:52px (L) | 44px | 40px; padding:0 16–20px; border-radius:999px; background:var(--cp-ink); color:var(--cp-bg); border:1px solid var(--cp-line); box-shadow:var(--k-sh-primary); font:600 15px/1 (L) | 13px/1 Outfit; letter-spacing:.01em; gap:7–9px` + ripple + pressed state. Colour variants: `peacock` (Track official case), `pulse`, `leaf`.

**Button: raised** (`variant="raised"`)
`height:40–44px; padding:0 13–14px; border-radius:999px; border:1px solid var(--cp-line); background:linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2)) or var(--cp-surface); box-shadow:var(--k-sh-raised); font:600 14px/1 | 700 13px/1` + pressed state. Used for Support/Oppose, region pill, secondary actions.

**Icon button**
`width/height:40px (36 in modals, 44 in inputs); border-radius:50%; border:none; background:var(--cp-surface-2); color:var(--cp-ink); font-size:16–18px`; active `transform:scale(.92)`.

**Vote button** (support ▲ / count)
`54×60px; radius 999px; raised shadow; column layout, gap 3px`. Transform and background animate on toggle with the spring easing.

**Chip / filter chip**
`height:34px; padding:0 12px; radius 999px; border:1px solid var(--cp-line); background:var(--cp-surface); color:var(--cp-ink-2); font:600 12px/1; gap:6px`; active `scale(.95)`. Selected state: `background:var(--cp-ink); color:var(--cp-bg)`.

**Status pill**
`display:inline-flex; height:22px; padding:0 8px; radius 999px; font:600 11.5px/1; white-space:nowrap`. Colours come from `PILL` / `GS`. Often followed by the progress track and a `ph-fill ph-warning` (pulse) when severity is hot.

**Segmented control**
Track: `display:flex; gap:2–6px; padding:3–4px; radius 999px; background:var(--cp-surface-2)`. Items: `height:32px; padding:0 14px; radius 999px; border:none; font:600 12px/1`. The selected item gets `surface` background and a subtle shadow.

**Input**
- Citizen: `height:42px; padding:0 16px; radius 21px; border:1px solid var(--cp-line); background:var(--cp-bg); font:500 13px/1`.
- Gov: `height:54px; padding:0 18px; radius 16px; border:1.5px solid var(--cp-line); background:var(--cp-surface); font:600 15px/1`; focus `border-color:var(--cp-ink)`.
- Textarea: `padding:12px 14px; radius 14px; border 1.5px; font:500 13.5px/1.45 Outfit,'Noto Sans Tamil'`.
- Field label sits above with `gap:8px` and uses the Label style.

**Card / list container**
`border-radius:20px; border:1px solid var(--cp-line); background:var(--cp-surface); overflow:hidden`. Rows inside: `padding:14px 16px; border-bottom:1px solid var(--cp-line)`; hover `background:var(--cp-bg)`, active `var(--cp-surface-2)`. Thumbnail: `96×72, radius 14, striped placeholder`.

**Table header row (gov)**
`padding:12px 18px; background:var(--cp-bg); border-bottom:1px solid var(--cp-line)`. Cells use the Label style.

**Map pin**
`height:30px; padding:0 11px 0 9px; radius 999px; box-shadow:var(--k-sh-pin); font:700 12px/1; gap:6px`, with an 8px dot. Colours come from the stage `PIN` map. Hover `scale(1.08)`. Selected or hot pins get a `cp-ping` halo behind them.

**Bottom sheet (mobile)**
`background:var(--cp-surface); border-radius:26px 26px 0 0; box-shadow:var(--k-sh-sheet)`. Drag handle: `40×5, radius 3, var(--cp-line)`, centred, with `padding:10px 20px 6px` and `touch-action:none`. Title uses Display M. It snaps between positions with a drag gesture (see `sheetDown` in methods).

**Full-screen overlay**
`position:fixed; inset:0; background:var(--cp-bg); animation:cp-sheet .4s`. Sticky header: `height:64px; padding:0 16px; border-bottom:1px solid var(--cp-line)` with a back icon button.

**Modal (gov)**
Behind it is a `--cp-scrim` backdrop. The panel is `background:var(--cp-surface); box-shadow:var(--k-sh-modal); max-width` per modal. Header: `padding:18px 22px; border-bottom`, title `600 16px/1`, 36px close icon button. On mobile it becomes a bottom sheet (see `mR`/`mAnim` in logic).

**Toast**
`position:fixed; top:16px; centred; padding:11px 16px; radius 14px; background:var(--cp-ink); color:var(--cp-bg); font:600 12.5px/1.2; box-shadow:var(--k-sh-toast); animation:cp-toast`. Icon is `ph-fill ph-check-circle` in `--cp-leaf`.

**FAB (Report an issue)**
`position:fixed; right:24px; bottom:24px; height:52px; padding:0 20px 0 16px; radius 999px; background:var(--cp-ink); font:600 14px/1; box-shadow:var(--k-sh-fab)`. Hover `translateY(-2px)`.

**Navigation rail (desktop, both apps)**
Always dark (`data-cp-theme="dark"`), `background:#000; border-right:1px solid #1a1a1a; padding:18px 12px 16px; gap:6px`. It collapses by animating its width, and has logo, nav items and badges.

**Tab bar (citizen mobile)**
Dark-themed bar fixed at the bottom with badges. See slice `27-tab-bar-mobile`.

**Avatar**
Circle (50%) with initials. Backgrounds cycle through `AVB`: `marigold-soft`, `peacock-soft`, `pulse-soft`, `leaf-soft`, …

**Section label**
`font:600 11px/1 Outfit; letter-spacing:.16em; text-transform:uppercase; color:var(--cp-ink-3)`.

---

## 3. Copy & voice
- Sentence case everywhere. The only uppercase text is the 11px section labels.
- Citizen copy is plain and neighbourly ("Nearby issues around you", "Slide to report"). Government copy is direct and procedural ("Pending approval", "Review now").
- Middle dot `·` separates meta items. Counts come before nouns ("12 citizens support this").
- Tamil strings are shown in Noto Sans Tamil. Keep the English/தமிழ் pairs exactly as in the prototype.

---

## 4. How to use in the build
1. Phase 1: import `tokens.css` in `app/globals.css` (section 1 verbatim).
2. Phase 1: create `components/ui/` with Button (primary, raised, colour variants), IconButton, VoteButton, Chip, StatusPill, ProgressTrack, Segmented, Input, Textarea, Card, ListRow, MapPin, BottomSheet, Overlay, Modal, Toast, Fab, Rail, TabBar, Avatar and SectionLabel. Also build `lib/domain/stage-style.ts` (PILL, GS, PIN, SEVL, SEGC, TRACK, AVB).
3. Build a `/_ui` page that renders every component in light and dark, and compare it against the screenshots.
4. When porting a slice, swap the matching markup for these components only if the rendered output is identical. When in doubt, keep the slice markup.
