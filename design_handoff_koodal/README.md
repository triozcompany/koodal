# Handoff: Koodal — Citizen PWA + Government Web App

## Overview
Koodal connects citizens and city government on one shared civic case. Citizens report issues (photo · voice · text), AI suggests category/severity/department and detects duplicates, the community supports/validates, government approves/rejects, assigns, fixes with proof, and citizens confirm the fix to close (or reopen) the case.

Two apps, one backend:
- **Koodal Citizen** — mobile-first installable PWA (also responsive to desktop).
- **Koodal Government** — desktop-first web app (responsive to mobile), Tamil + English.

## About the design files
Files in `design/` are **HTML design references** — working prototypes showing the exact look and behaviour. They are not production code. Recreate them in **Next.js (App Router) + TypeScript + Firebase (Auth, Firestore, Storage, Cloud Messaging, Functions) + Gemini API + Google Maps**, deployed on Vercel (or Firebase App Hosting).

Open them in a browser to click through (serve the folder: `npx serve design`).
- `?screen=<name>` deep-links citizen screens, `?tab=<name>&cur=<id>` deep-links government.
- The two prototypes share state via `localStorage` — open both in two tabs to watch a report travel from citizen → government → citizen.

### How to read a `.dc.html` file
Each file = `<helmet>` (fonts, icon CSS, CSS variables, keyframes) + a template with inline styles + a `class Component` logic block at the bottom.
- Template holes `{{ x }}` are values computed in `renderVals()`.
- `<sc-if value="{{ x }}">` = conditional render, `<sc-for list="{{ xs }}" as="x">` = map.
- `style-hover="…"` / `style-active="…"` = `:hover` / `:active` styles.
- `civicpulse-data.js` is the **mock backend** — its `A` object is the exact list of domain actions and business rules to reimplement server-side.
- The files are large (Citizen ≈ 450 KB). Read with offsets / grep by section.

## Fidelity
**High-fidelity.** Match colours, type, spacing, radii, shadows, copy, icons, animations and interactions exactly. When a detail isn't described here, the HTML is the source of truth.

## Design system
Koodal uses its **own** design system (not TrainerCentral/Zoho). Full spec: `DESIGN_SYSTEM.md`; variables: `tokens.css`.

## Design tokens (both apps)
Fonts (Google Fonts): **Outfit 300–800** (UI), **DM Serif Display** (display headings, Government), **Noto Sans Tamil 500** (Tamil strings).
Icons: **Phosphor Icons 2.1.1** web font (`@phosphor-icons/web`), `ph-bold` + `ph-fill` classes — see `ICONS.md`.

Colours are CSS variables, themed with `[data-cp-theme="light"|"dark"]`:

| token | light | dark |
|---|---|---|
| --cp-desk | #f3f3f3 | #000 |
| --cp-bg | #ffffff | #0d0d0d |
| --cp-surface | #ffffff | #141414 |
| --cp-surface-2 | #f5f5f5 | #1e1e1e |
| --cp-ink | #0f0f0f | #f5f5f5 |
| --cp-ink-2 | #4d4d4d | #bdbdbd |
| --cp-ink-3 | #8a8a8a | #7c7c7c |
| --cp-line | #ebebeb | #262626 |
| --cp-edge | #e2e2e2 | #2e2e2e |
| --cp-pulse (primary) | #e8590c | #f97316 |
| --cp-pulse-deep | #c2410c | #ea580c (citizen) / #fb923c (gov) |
| --cp-pulse-soft | #fff4ec | #2b1305 |
| --cp-marigold | #f5b30a | #f5b30a |
| --cp-marigold-soft | #fff8e6 | #2a2003 |
| --cp-peacock | #0f8b83 | #2dd4bf |
| --cp-peacock-soft | #eaf7f5 | #062624 |
| --cp-leaf (success) | #12a150 | #22c55e |
| --cp-leaf-soft | #e8f7ee | #06240f |
| --cp-on-marigold | #0f0f0f | #0f0f0f |
| --cp-map / -line / -road | #f2f2f2 / #e7e7e7 / #fff | #111 / #1b1b1b / #242424 |
| --cp-map-park / -water | #e6f4ea / #e6eff5 | #0b2413 / #0a1f2b |
| --cp-ph-a / -b (placeholders) | #f4f4f4 / #ededed | #1a1a1a / #222 |
| --cp-scrim | rgb(0 0 0/.45) | rgb(0 0 0/.6) |

Copy the full `:root` block, keyframes (`cp-in`, `cp-row`, `cp-ping`, `cp-scan`, `cp-pop`, `cp-stamp`, `cp-sheet`, `cp-toast`, …) and the `.cp-rip` ripple CSS **verbatim** from each file's `<helmet><style>` into `globals.css`. Spacing, radii and shadows are inline in the templates — port them literally.

Global behaviours in both apps:
- Material-style ripple on dark buttons (the `rip` pointerdown handler in `componentDidMount`).
- Haptics: `navigator.vibrate(5)` on button press (toggleable).
- Responsive breakpoint via `window.innerWidth` (`isMobile` / `isDesk`, `mob` / `notMob`) — replicate with the same thresholds found in `renderVals()`.

## Screens

### Citizen (`screen` state)
`home` (map + draggable bottom sheet / feed, filters: region, category, stage, severity) · `feed` · `search` (sort relevant / recent, area + department pickers) · `detail` (issue: support / oppose, evidence, comments, share, edit/delete if mine) · `report` (camera capture w/ hold-to-shoot, voice, text, tags, anonymous toggle) · `ai` (AI analysis steps: category, severity, department, summary) · `similar` (duplicate found → join existing or file new) · `verify` (swipe-deck community validation, stamp animation) · `case` (official case view) · `timeline` · `cases` (Following / My reports tabs) · `profile` · `settings` (theme, notifications, anonymous default). Phone-OTP identity sheet (`idOpen`, `idStep`, `otp`) gates actions that need a verified user (`meVerified`).

### Government (`tab` state)
Login (Employee ID + password → OTP) · `home` dashboard (decisions due, overdue, SLA risk, alerts) · `cases` (Kanban/table: pending → assigned → progress → fixed / rejected; drag to move; filters status, city, area, dept, category; sort by priority score) · `case` detail (evidence, AI confidence, timeline) · `map` (pan/zoom, layers: cases, hotspots, emerging) · `insights` (range 7d/30d/90d/custom, metrics, bar/line chart, dept table) · `search` (`/` shortcut, recents) · `profile` · `settings`.
Modals: `approve` (dept, team, target date, note), `reject` (reason, note, proof photos, reference), `assign` (edit dept/team/date), `update` (post note), `fix` (proof photos + note).
Props to keep as config: `scope` (Chennai / Coimbatore / Madurai / All), `decisionSla` (24/48/72 h), `showEmerging`.

## Flow & business rules (from `civicpulse-data.js` — implement server-side)
Stages: `reported → community → review → assigned (official case) → progress → resolved → closed`, plus `rejected`; `resolved → progress` on reopen. Labels/steps are in `STAGES`.
- **support**: +1 sup, conf +2. `reported` becomes `community` at sup ≥ 5.
- **oppose**: conf −3 (mutually exclusive with support). Author can't oppose own.
- **evidence**: implies support; first contribution conf +1; logs timeline event.
- **validate** yes/no: conf +1 / −3.
- Crossing **conf ≥ 80%** from reported/community → `review` + event "Community verified · N% — Sent to {corp}".
- conf clamped 5–97.
- **report**: AI `analyze()` → if duplicate match score ≥ 85 show `similar`; **join** merges into existing (adds tags, merged entry, photos, support). New report starts `reported`, sup 1, conf 24, needed 25 confirms.
- **approve** (gov): creates `caseId = CP-{CITYCODE}-{seq}`, sets dept, team, due → `assigned`, 3 timeline events (+ optional note).
- **reject**: `rejected` with reason, note, proof, ref.
- **setStatus progress**: "Work started on site". **markFixed**: `resolved`, proof photos, citizens asked to confirm.
- **confirm** (citizen): fixed → confirms++; closes at confirms ≥ needed (25). Not fixed → disputes++; at 3 disputes while `resolved` → back to `progress`, `reopened++`.
- Priority score: `min(99, SEVW[sev] + conf*0.4 + min(sup,60)*0.3)`, SEVW critical 40 / high 30 / medium 20 / low 10.
- SLA: `slaLeft` / `slaRisk` (0 ok, 1 < 24 h, 2 overdue).
- Every change appends to `events[]` = the shared case timeline shown in both apps.
- Categories → departments, cities → corporations/officers: `CATS`, `CITY`.

## Target architecture
- **Firebase Auth**: phone OTP (citizen); email/employee ID + password + OTP / custom claims `role: 'gov'`, `city`, `dept` (gov).
- **Firestore**: `issues/{id}` (fields = issue object), `issues/{id}/events`, `/comments`, `/evidence`; `users/{uid}` (profile, prefs, anonDefault); `users/{uid}/actions/{issueId}` (support/opposed/validated/confirmed/contrib — replaces `S.my`); `counters/*` for id sequences; `departments`, `cities`.
- **Cloud Functions / Route handlers**: all state-changing actions above run in transactions (never trust the client for conf/stage).
- **Storage**: report photos, fix proof, reject proof.
- **FCM**: status-change notifications to supporters/author.
- **Gemini API** (server only): image + voice/text → category, severity, department, title, summary; embeddings/geo for duplicate matching; gov insights. Speech-to-text (Tamil/Tanglish/English) with English translation.
- **Google Maps JS API** for maps & geolocation (style it to the `--cp-map*` tokens).

## Assets
- `design/assets/koodal-mark.png` — logo.
- Photos in the prototype are striped placeholders (`--cp-ph-a/b`) — replace with real uploads.

## Screenshots (`screenshots/`)
Pixel references captured from the prototypes, light theme. Match these exactly.
- `citizen-mobile/` (390×844): 01 home map + sheet · 02 filters · 03 feed · 04 search · 05 issue detail · 06 report capture · 07 AI analysis running · 08 AI result · 09 duplicate found (join) · 10 is-it-fixed check · 11 official case · 12 timeline · 13 my cases · 14 profile · 15 settings
- `citizen-desktop/` (1440×900): 01 home map + list · 02 issue selected on map · 03 feed · 04 search · 05 issue detail · 06 report upload · 07 AI analysis · 08 duplicate found · 09 is-it-fixed · 10 official case · 11 cases · 12 profile · 13 settings · 14 filters
- `gov-desktop/` (1440×900): 01 login · 02 OTP · 03 dashboard · 04 cases grid · 05 cases board · 06 cases list · 08 case pending review · 09 case in progress · 10 case fixed, awaiting citizens · 11 approve & assign · 12 reject · 13 edit assignment · 14 post update · 15 mark fixed · 16 map · 17 map pin selected · 18 insights · 19 search · 20 profile · 21 settings
- `gov-mobile/` (390×844 @2x): 01 login · 02 dashboard · 03 cases · 04 case detail · 05 approve sheet · 06 map · 07 insights

Flow order for end-to-end testing: citizen 06→07→08→09 (report) → gov 08→11 (approve) → 09→15 (fix) → citizen 10 (confirm) → closed.

## Screen slices (`screens/`)
The two prototypes are cut into one small folder per screen/overlay (39 citizen, 16 government) so each can be ported with a small context: `markup.html` (verbatim template), `logic.js` (its value computations), `README.md` (screenshots + values). Shared CSS/fonts/handlers live in `screens/<app>/_shared/`; `shell.html` shows how the slices nest. Index: `screens/INDEX.md`.

## Files
- `ICONS.md` — icon setup + full checklist
- `DESIGN_SYSTEM.md` — Koodal design system: foundations + component specs
- `tokens.css` — all theme variables, keyframes, ripple (verbatim) + named scale tokens
- `screens/` — per-screen slices (start here)
- `screenshots/` — reference captures listed above
- `design/Koodal Citizen.dc.html` — citizen app (source of truth)
- `design/Koodal Government.dc.html` — government app (source of truth)
- `design/civicpulse-data.js` — mock store, seed data, all business rules
- `design/reference/*` — report flow, technical architecture, features by role diagrams
- `CLAUDE_CODE_PROMPT.md` — the prompt to paste into Claude Code
