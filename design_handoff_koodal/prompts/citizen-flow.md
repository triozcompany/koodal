# Koodal Citizen: complete UI flow spec (Claude Code prompt)

You are porting the **Koodal Citizen** app. This document explains **how the app flows**: every screen, what it shows, every action, and where each action leads. Pair it with the per-screen slices (`screens/citizen/<NN>/`) for exact markup, and follow the hard rules in `CLAUDE_CODE_PROMPT.md`, `DESIGN_SYSTEM.md` and `ICONS.md`.

**Golden rule:** when this doc and the prototype disagree, the prototype wins. Check behaviour by running `npx serve design_handoff_koodal/design` and opening `Koodal Citizen.dc.html`. Deep-link with `?screen=<name>&cur=<issueId>`.

---

## 0. Mental model

Koodal is one **shared civic case** that moves through stages. The citizen app lets people **discover → report → support → track → confirm the fix**.

```
reported ──(5 supports)──▶ community ──(conf ≥ 80%)──▶ review ──(gov approves)──▶ assigned
   │                                                     │                              │
   └────────────── gov rejects ──────────────────────────┴──▶ rejected                   ▼
                                                                                     progress
                                                                                        │ gov marks fixed
                                                                                        ▼
                                  3 × "not fixed" ◀── resolved ──(25 confirms)──▶ closed
                                  (back to progress, reopened++)
```

Citizen-facing labels (`PILL` in `stage-style.ts`):
- New
- Gathering support
- With govt
- Official case
- In progress
- Fixed · confirm
- Closed
- Not accepted

---

## 1. App shell & navigation

### Responsive split
- **Mobile (< 720px):** full-screen screens, bottom **tab bar**, floating **Report** button, bottom sheets.
- **Desktop (≥ 720px):** left **navigation rail** (always dark, collapsible), main content, side panels instead of sheets. On desktop, `timeline` is merged into `detail`, and `search` auto-focuses its input.

### Primary destinations (the "tabs")
`TABS = ['home','feed','search','cases']`. Going to a tab **clears the history stack**.
- Mobile tab bar: Home (map), Feed, Search, Cases, plus a profile avatar that opens the **profile drawer**.
- Desktop rail: logo, **Report issue** CTA, Home, Feed, Search, Cases (with badges), a profile row at the bottom, and a collapse toggle.

### Flow screens (not stored in history)
`FLOW` = `report`, `ai`, `similar`, `verify`, and the threshold celebration. Back from these returns to the screen you launched them from (`base`), not to each step.

### History & back
- `go(screen, extra)` pushes the previous `{screen, cur}` onto `hist`, capped at 20, with flow screens filtered out.
- `goBack()` pops, skipping flow screens and duplicates. With empty history it goes to `home`.
- Every non-tab screen has a **back** button in its header. On mobile, the system back gesture calls `goBack()` too.

### Global UI
- **Toast:** top-centre, auto-hides. Used after every mutation, e.g. "Your photo was added as evidence".
- **Ripple + haptics** on every button (`buzz(ms)` = `navigator.vibrate`).
- **Theme:** light/dark via `data-cp-theme`, set in Settings.
- **Identity gate:** any action that needs a verified user (support, oppose, evidence, comment, report, confirm) opens the identity sheet or onboarding first when needed, then **resumes the action** (`afterId`).

---

## 2. First run: Sign-in & onboarding (slice `38-sign-in-onboarding`)

Shown on first launch, or when a gated action is attempted while signed out.

| Step | What it shows | Actions → next |
|---|---|---|
| **intro** | Logo, "Fix your street, together.", auto-advancing slides (`SL`) with dots, cities strip "GREATER CHENNAI · COIMBATORE · MADURAI" | **Get started** → phone (signup) · **I have an account** → phone (login) · **Skip** → home as guest |
| **phone** | "What's your number?" or "Welcome back", +91 field (10 digits, border turns leaf-green when valid), "We'll text a 6-digit code…", **Use demo number** | Continue → otp |
| **otp** | "Enter the code", "Sent to +91 XXXXX XXXXX · Change", 6 boxes that fill with a pop animation, note/timer | Auto-verify on the 6th digit → aadhaar (signup) or done (login) · Change → phone |
| **aadhaar** | "Verify you're a resident", explanation, 12-digit field, **Use demo Aadhaar**, consent checkbox, success line "Verified · resident of Tamil Nadu" | Continue (enabled once consent is ticked) → profile |
| **profile** | "Set up your profile", avatar initials, name, **YOUR AREA** picker, toggle "Post anonymously by default" | Continue → perm |
| **perm** | "See what's happening around you", location explanation, secondary option | **Allow location** / Not now → finish → home, with a toast |

- Header has back (`auBack`) and a step progress indicator.
- Login mode runs only `phone → otp`.
- Finish calls `A.setMe` (name, area, anonDefault, verified).

**Firebase later:** phone → Firebase Auth phone OTP; aadhaar → a stub verification function that stores only `verified: true`.

---

## 3. Home: map + nearby (mobile `10-home-mobile`, desktop `01-home-desktop`)

**Purpose:** see issues around you and jump into one.

**Shows**
- Header: location/region pill ("Near me" or city), **Filters** button with a count badge, avatar (drawer on mobile).
- **Map** (drawn, styled with `--cp-map*`): pan and wheel-zoom, pins coloured by stage with a category icon, `cp-ping` halo on hot or selected pins, and a "you are here" dot.
- **Mobile:** draggable **bottom sheet** titled "Nearby". It snaps between peek, half and full (`sheetTop`, `sheetDown`), and lists issue cards sorted by distance.
- **Desktop:** map with a list column. Selecting a pin highlights its card and shows a **preview card** (`msel`: photo, title, meta, pill, **Open**).

**Issue card** (used on home, feed, search and cases)
- Striped photo thumbnail with photo count
- Title, area · distance · time ago
- Stage pill, 5-segment progress track, severity warning icon
- Supporter count

**Actions**
- Tap pin → select / preview (desktop) or scroll the sheet to the card (mobile).
- Tap card or **Open** → `detail{cur:id}`.
- Region pill → **Location picker** (`31`/`32` "Where to explore": Near me (1.5 km) or a city, with search and the empty state "No area matches").
- Filters → **Filters** (`30`).
- Report FAB / rail CTA → `report`.

Filtering: `region` (near = Chennai within 1.5 km, or a city), `cat[]`, `stage[]` (grouped via `STG`), `sev[]`. Rejected issues are always hidden.

---

## 4. Filters (slice `30-filters`)
Bottom sheet on mobile, panel on desktop.
- Sections: Region, Category chips (with icons), Stage chips (coloured dots), Severity chips. Some groups are combo-boxes with search (`cb`), e.g. area and department.
- Each option shows its live count. There's a "No match" empty state.
- Footer: **Clear all**, plus a primary button labelled with the result count, e.g. "Show 12 issues".
- The same component serves home, feed, search and cases (`fCtx`).

---

## 5. Feed (mobile `11`, desktop `02`)
- Vertical list of rich issue cards: photo, title, AI one-liner, pill, support count, comments.
- Sort toggle (`feedSort`, default "nearby"). Filters button.
- Card → `detail`. Inline support, if present in markup, follows the same rules as detail.

---

## 6. Search (mobile `12`, desktop `03`)
- Search input (auto-focus on desktop), a Filters button with count, and a **sort** dropdown: Relevant or Recent.
- Before typing: **TRENDING TAGS** as `#tag` chips with counts, and recent searches.
- Active-filter chips (`af`) are removable.
- Advanced pickers: **Area** and **Department** combo-boxes with search.
- Results use issue cards → `detail`.

---

## 7. Issue detail (mobile `13`, desktop `04`): the hub
Full spec: `prompts/issue-detail.md`. Summary of what it shows, top to bottom:
1. Header: back, ID, **Edit** (own, unlocked), **Share**.
2. Photo gallery → **Photo viewer** (`33`, prev/next/swipe/Esc).
3. Title, stage pill, progress track, severity, category, area, time, author (or Anonymous) with verified badge.
4. Description text and/or **voice note** (play, waveform, duration, language, translation), tags.
5. **AI SUMMARY**, plus "N similar reports combined" when merged.
6. Community stats: supporters, evidence, photos, "say not an issue".
7. **Case banner** (one of):
   - pre-case confidence toward 80%
   - **OFFICIAL CASE · ID** with dept, officer, SLA → Track official case
   - **Not accepted by {corp}** with reason
   - **Reports in this case**
8. **Evidence** grid: Add (gated) / remove own.
9. **Comments**: inline on desktop; a sheet on mobile (`34`).
10. **Timeline** (desktop inline; mobile → `timeline` screen).
11. **Action area** (sticky; exactly one state):
   - **Support** (press-and-hold 800 ms with a progress ring → `A.support`; tap again to unsupport) plus **Not an issue** (`A.oppose`, not for the author)
   - **Your report** (edit shortcut)
   - **With government · locked**
   - **Track official case** → `case`
   - **Check the fix** → `verify`
   - **Closed**
- If a support pushes confidence over 80% (`r.crossed`), fire the **Threshold celebration** after 700 ms.
- **Edit report** (`35`): title, description, photos add/remove, tags add/remove, Save, and Delete with confirm ("Keep it" / "Delete report") → back to feed with a toast.

---

## 8. Report an issue: the main flow

### 8.1 Capture (slice `14-report-capture`)
- Full-screen **camera** (dark UI). Hint "Point at the issue". "GPS ±8 m" chip. Flash animation on shutter.
- **Scene picker** chips in the demo (sewage, pothole, …) set the category icon; in production the camera feed replaces them.
- **Shutter:** tap to capture, up to 10 shots. Thumbnails strip, **Retake all**. The camera area shrinks from 64% to 52% after capture.
- **Describe** toggle, text or voice (`descMode`):
  - Text: textarea.
  - **Voice**: tap mic → recording (red, animated waveform, 0:03) → done (check, "0:04 · Tamil"). Transcript and English translation come later.
- **Tags**: type, then Enter or add; remove chips.
- **Post anonymously** toggle, defaulted from profile.
- Primary control is **Slide to report** (drag the thumb to the end; releasing early springs it back). On completion → `submitReport()` → `ai`.
- Desktop: the same content as an upload panel (drop zone, previews) inside the rail layout.
- Close/back → returns to `base`, discarding the draft (confirm if it has content, when present in markup).

### 8.2 AI analysis (mobile `16`, desktop `15`)
- Shows your photo with a scanning animation (`cp-scan`) and the label "your photo · {scene}", plus detected label and confidence %.
- Rows reveal one by one (`aiStep` 0→6, ~500 ms each): **Category**, **Severity**, **Department**, **Location**, **Summary** (row.k / row.v / row.sub).
- While thinking, the rows show a shimmer and the button is disabled.
- When done, the button label depends on duplicate matches:
  - strong match (≥ 85%): **"1 match nearby · See it"** (marigold) → `similar`
  - weaker matches: **"Similar nearby · Compare"** (marigold) → `similar`
  - no match: **"Post as new issue"** (pulse) → `postNew()` → `detail{cur:newId}` + toast
- Back → `report` (keeps the draft).

**Firebase later:** Gemini returns category, severity, department, title and summary; duplicate search uses geo radius + category + embedding score.

### 8.3 Similar / duplicate (mobile `17`, desktop `18`)
- Title: **"Already on the map."** (strong) or **"Same issue?"**
- Side-by-side comparison: **your photo** (tag "You · now" or "Anonymous · now") vs the **existing report** (by, hours ago, "+1 photo").
- Match facts: **{score}% match**, **{dist} m apart**, **{sup} supporters**, "N similar reports merged".
- Buttons:
  - Strong match: **Join {sup} neighbours** (primary → `join(id)`: 1.4 s joining state "Joined · N neighbours" → `detail{cur:id}` + toast "Your photo was added as evidence") and **Mine is different** (secondary → `postNew()`).
  - Weak match: **Post as new issue** (primary) and **Join this one instead** (secondary).
- Joining counts as support plus evidence, and may trigger the threshold celebration.

### 8.4 Threshold celebration (mobile `20`, desktop `19`)
- Fires when confidence crosses **80%** (from support, join, validate or evidence).
- Big animated **{N}%**, "{sup} neighbours", **Community verified**, "Sent to {corp} · {dept}", confetti/stamp animation.
- **Track verification** → `detail` / `case`. Tap outside or close to dismiss.
- The timeline gets "Community verified · N% — Sent to {corp}".

---

## 9. Official case (slice `21-official-case`)
- Header: back, case ID. Pending state shows `pendTitle`/`pendSub` if not yet approved.
- **VERIFIED** badge, title, corporation, **CP-CITY-NNN**.
- Fact grid: **DEPARTMENT**, **OFFICER** (assignee), **AREA**, **PRIORITY** (score), **SLA** (time left, turning pulse-coloured when at risk).
- **Now** card: the latest status (`nowTitle`, "Xh ago").
- **Notify me** toggle (`toggleNotify`) for push on changes.
- Latest timeline preview → **View timeline** → `timeline` (mobile) or detail (desktop).
- When resolved: **Check the fix** → `verify`.

## 10. Timeline (slice `22-timeline`, mobile only)
- Vertical list of `events[]`: time, title, sub, optional photo. The current event pulses (`e.live`) and a connector line joins them.
- A sticky **Check the fix** CTA shows when stage = resolved.

## 11. Is it fixed? Verify (slice `23-verify-fix`)
- Header: case ID, "Is it fixed?", title.
- **Before / After** comparison slider: drag the divider (`split`). Labels "BEFORE" and "AFTER · PROOF", with photo selectors for each side (`vbSel`, `vaSel`), lines like "Shot 6 m from report" and the officer name.
- Progress: "{confirms} of {needed} neighbours · closes at {needed}".
- Two big buttons:
  - **Not fixed** (raised) → reason picker (`REASONS` chips with icons, e.g. still broken or partial) → submit → `A.confirm(false)` → toast. Cancel → back to the choice.
  - **Fixed** (primary, leaf) → `A.confirm(true)` → result "**Confirmed.**", or "**Case closed!**" if this confirm reached `needed`, with a stamp animation.
- 3 disputes while resolved → case reopens (progress). Show the updated state on return.
- **Community validation deck** (same screen family): a swipeable card stack (`deck`, `vDown`). Swipe right = real (+1), left = not real (−3), with a stamp overlay. It ends with a results summary (`vres`), including any threshold crossings.

## 12. Cases (mobile `24`, desktop `05`)
- Tabs (segmented): **Following** (reports you support or created that became cases) and **All in {city}**.
- View toggle: **List** / **Grid**. Filters with count. Sort (`cSort`: recent, …). "{N} cases" count.
- Case card: photo count, **CP-CITY-NNN · area**, title, stage pill, progress, SLA → `case` (or `detail`).
- Empty states per tab.

## 13. Profile (mobile `25`, desktop `06`) + Profile drawer (`36`)
- **Drawer** (mobile avatar tap): name, area, rows for My reports, Supported, My cases, Activity, and Settings & theme (with counts); **View profile**; **Report an issue**.
- **Profile page**: avatar, name, verified badge, "{area} · civic member since Aug 2026", and stats (`s.v` / `s.l`).
- Tabs: **Reports** (camera), **Backed** (arrow-fat-up), **Cases** (bank), **Activity** (clock). Each has its own list and empty state.
- Report rows show why/AI line, name · ago, place, title, text, and a status chip → `detail`.
- Activity rows → open the related issue.

## 14. Settings (mobile `26`, desktop `07`)
- Account card: avatar, name, phone · area, **Edit profile** → inline form (**NAME**, **AREA / WARD**, Cancel / **Save profile**).
- **PREFERENCES** rows with toggles or selectors:
  - Theme (Light / Dark / System)
  - Notifications
  - Post anonymously by default
  - Haptics
  - Language
- Sign out.

---

## 15. Cross-cutting behaviours (implement once)
- **Optimistic updates:** every action updates the UI immediately, then syncs. In the mock store they're synchronous.
- **Counts & badges** update everywhere at once, because every screen reads from one store subscription (`CP.sub` → Firestore `onSnapshot` later).
- **Gated actions** follow the §1 identity gate: sign-in/OTP, then resume.
- **Author rules:**
  - Authors can't oppose their own report.
  - Edit/delete is only allowed before the government locks the report (`lockedMine`).
  - Anonymous reports never show the name.
- **Empty, loading and error states:** use each slice's markup states. Never leave a blank panel.
- **Animations:** screen enter `cp-in`, list rows `cp-row` (staggered), sheets `cp-sheet`, toast `cp-toast`, hold ring, slide-to-report spring, and swipe-deck physics. All are listed in `DESIGN_SYSTEM.md` §Motion.

---

## 16. End-to-end journeys to test (both widths, both themes)
1. **New user:** intro → phone → OTP → Aadhaar → profile → location → Home.
2. **Discover:** Home map → pin → preview → detail → photo viewer → comment → back to map, keeping its position.
3. **Report, new:** FAB → capture 2 photos → voice note → tag → slide → AI (no match) → Post as new → detail (New, 1 supporter).
4. **Report, duplicate:** capture sewage scene → AI strong match → Similar → Join neighbours → detail (+evidence, toast).
5. **Support to threshold:** detail → hold support → confidence crosses 80% → celebration → Track verification.
6. **Track:** Cases → Following → case → timeline → notify toggle.
7. **Confirm fix:** case resolved → Check the fix → drag before/after → Fixed → "Confirmed." / "Case closed!".
8. **Dispute:** Check the fix → Not fixed → reason → submit (3 disputes reopens the case).
9. **Edit/delete:** own report → Edit → change title/tags → Save → Delete → confirm → feed.
10. **Filters/search:** filter by stage + severity on Home → search "#pothole" → sort Recent → area picker.

For each journey: screenshot every step and compare with the prototype at the same step. Fix differences before moving on.

---

## How to run this with Claude Code
Do **not** build it all at once. Use this doc as the map, and port one slice per session:
```
Read design_handoff_koodal/prompts/citizen-flow.md (sections 1 and <N>) and port slice screens/citizen/<NN-name>/. Wire every action and navigation exactly as described there and in _shared/methods.js. Follow CLAUDE_CODE_PROMPT.md hard rules. Diff until < 1%, then run the matching journey from section 16 and report.
```
