You are building **Koodal**, a civic-issue platform with two apps — a **Citizen PWA** and a **Government web app** — sharing one Firebase backend. Your job is to **port** the existing high-fidelity prototype, not to design anything.

## Source of truth (read in this order)
1. `design_handoff_koodal/README.md` — flows, business rules, architecture.
1a. `design_handoff_koodal/ICONS.md` — icon setup + checklist of all icons.
1b. `design_handoff_koodal/DESIGN_SYSTEM.md` + `design_handoff_koodal/tokens.css` — Koodal's own design system (colour roles, stage colours, type, spacing, radius, elevation, motion, components). Not the TrainerCentral/Zoho system.
2. `design_handoff_koodal/screens/INDEX.md` — the prototype cut into one small folder per screen/overlay. **Work from these, not from the big .dc.html files.**
   - `screens/<app>/<NN-screen>/markup.html` — exact template for that screen
   - `screens/<app>/<NN-screen>/logic.js` — the value computations it needs
   - `screens/<app>/<NN-screen>/README.md` — screenshots to match + values used
   - `screens/<app>/_shared/` — `helmet.html` (fonts, icons, CSS variables, keyframes), `shell.html` (how screens nest), `constants.js`, `methods.js` (handlers, gestures, navigation), `render-vals.js` (full logic)
3. `design_handoff_koodal/screenshots/` — pixel references (citizen-mobile, citizen-desktop, gov-desktop, gov-mobile).
4. `design_handoff_koodal/design/civicpulse-data.js` — mock backend: every business rule, seed data, labels.
5. Only if a slice is unclear: the full prototypes in `design_handoff_koodal/design/` (open with `npx serve design_handoff_koodal/design`).

## Hard rules — fidelity
- **Port, don't rebuild.** Convert each `markup.html` to JSX nearly 1:1. Same element tree, same order, same copy (incl. Tamil/Tanglish).
- **Keep every inline style value exactly** as React style objects. No Tailwind, no CSS-in-JS rewrite, no "cleanup", no new spacing/radius/shadow/colour values. `style-hover`/`style-active` → CSS `:hover`/`:active` via a tiny CSS module per component.
- Import `design_handoff_koodal/tokens.css` into `app/globals.css` (section 1 is the prototype CSS verbatim). Load Outfit, DM Serif Display, Noto Sans Tamil via `next/font/google`; icons via `@phosphor-icons/react` (same icon + weight as each `ph-*` class).
- Template syntax: `{{ x }}` → `{x}`; `<sc-if value="{{ x }}">` → `{x && …}`; `<sc-for list="{{ xs }}" as="x">` → `xs.map(x => …)`; `class` → `className`.
- Port `logic.js` / `render-vals.js` computations and `methods.js` handlers as-is (TypeScript types added, behaviour unchanged). Same breakpoints, gestures (bottom-sheet drag, swipe, hold-to-capture, slide-to-report, map pan/zoom), animations, haptics, ripple.
- Use `components/ui/*` and `stage-style.ts` for every button, chip, pill, input, card, sheet, modal, toast, pin — only when output is identical to the slice markup.
- Keep the prototype's own drawn map until the very last phase.
- Never mark a screen done without the screenshot diff below.

## Visual verification loop (set up in phase 1, use on every screen)
- Playwright script: `pnpm shot <route> <width>x<height>` saves a screenshot of your build.
- `pnpm diff <mine.png> <reference.png>` with pixelmatch → prints % difference and writes a diff image.
- Target: **< 1% difference** at 390×844 and 1440×900 against the screenshot(s) listed in that slice's README. Loop: diff → fix → re-shot until under target. Report the final %.

## Stack
- Next.js 15 App Router + TypeScript. Interactive screens are client components.
- Firebase: Auth (phone OTP for citizens; employee ID + password + OTP with custom claims `role`, `city`, `dept` for government), Firestore, Storage, Cloud Messaging, Cloud Functions or route handlers with firebase-admin.
- Gemini API (server only) for report analysis, duplicate detection, summaries, insights; Google speech-to-text (Tamil/Tanglish/English → English).
- Google Maps JS API (final phase only), styled with the `--cp-map*` tokens.
- PWA: manifest, service worker, installable; camera, location, push.

## Structure
- `app/(citizen)/…` and `app/(gov)/gov/…` — one route per screen slice; overlays as components.
- `components/<app>/<SliceName>.tsx` — one component per slice folder, same name.
- `lib/domain/` — types + pure rules ported from `civicpulse-data.js` (`bump`, `score`, `slaLeft`, `slaRisk`, stage transitions) with Vitest tests reproducing the prototype exactly.
- `lib/store/` — **phase 1–6: a port of `civicpulse-data.js` (local mock)**; phase 7 swaps it for Firestore behind the same interface.
- `server/actions/` — one action per `A.*` in `civicpulse-data.js` (support, oppose, evidence, validate, comment, report/join, edit/delete, approve, rejectCase, editAssign, note, setStatus, markFixed, confirm, …), each in a Firestore transaction appending timeline events like the prototype.
- `scripts/seed.ts` — seed Firestore with the prototype's rows, cities, departments, officers.

## Firestore model
`issues/{id}` + subcollections `events`, `comments`, `evidence`, `merged`; `users/{uid}`; `users/{uid}/actions/{issueId}`; `counters/*`; `cities`; `departments`. Security rules: citizens write only via server actions; gov users scoped by `city`/`dept` claims; anonymous reports never expose author uid.

## Build order — ONE slice per session, stop after each for my review
1. Setup: Next app, `tokens.css`, fonts, icons, theme toggle, ripple + haptics utils, `lib/store` mock port, domain rules + tests, Playwright shot + pixelmatch diff scripts.
1b. Design system: build every component in DESIGN_SYSTEM.md §2 in `components/ui/` + `lib/domain/stage-style.ts`, plus a `/_ui` page showing all of them in light and dark. Stop for review. Screens must reuse these — never restyle per screen.
2. Citizen shells: `shell.html` layout, `00-desktop-rail`, `27-tab-bar-mobile`, `37-report-fab`.
3. Citizen browse: `10`–`13` (mobile), `01`–`04` (desktop), `30-filters`, `31`/`32` location pickers, `33-photo-viewer`, `34-comments`.
4. Citizen report flow: `14-report-capture` → `15`/`16` AI analysis → `17`/`18` similar → `19`/`20` threshold; `35-edit-report`; `38-sign-in-onboarding`.
5. Citizen cases: `21-official-case`, `22-timeline`, `23-verify-fix`, `24`/`05` cases, `25`/`06` profile, `26`/`07` settings, `36-profile-drawer`.
6. Government: `00-login`, `01-desktop-rail`, `02`/`03` mobile chrome, `10-dashboard`, `11-cases`, `12-case-detail`, `23-action-modals`, `13-map`, `14-insights`, `20-date-range-picker`, `15-search`, `16-profile`, `17-settings`, `21-product-tour`, `22-filter-sort-sheet`.
7. Backend swap: Firebase Auth, Firestore + `onSnapshot` real-time (replacing the localStorage sync), Storage, Gemini, speech, FCM, Google Maps, security rules, deploy (Vercel + Firebase). Re-run every screenshot diff after the swap.

## End-to-end acceptance test
Both apps side by side: citizen reports → AI analysis → duplicate check → support reaches 80% → case appears in gov "pending review" → approve & assign → in progress → mark fixed with proof → citizens confirm → closed at 25 confirms (or 3 "not fixed" reopens). Every step updates both apps in real time and appears on the shared timeline.

## Per-session prompt I will give you
"Port slice `screens/<app>/<NN-name>/`. Read its README, markup.html, logic.js and the screenshots. Follow CLAUDE_CODE_PROMPT.md hard rules. Diff until < 1%. Report the % and stop."
