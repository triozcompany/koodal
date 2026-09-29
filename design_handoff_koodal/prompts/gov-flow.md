# Koodal Government: complete UI flow spec (Claude Code prompt)

You are porting the **Koodal Government** console. This document explains **how the console flows**: every screen, what it shows, every action, and where each action leads. Pair it with the per-screen slices (`screens/gov/<NN>/`) for exact markup, and follow the hard rules in `CLAUDE_CODE_PROMPT.md`, `DESIGN_SYSTEM.md` and `ICONS.md`.

**Golden rule:** when this doc and the prototype disagree, the prototype wins. Check behaviour by running `npx serve design_handoff_koodal/design` and opening `Koodal Government.dc.html`. Deep-link with `?tab=<name>&cur=<issueId>`, which also skips login. Open the Citizen prototype in another tab to watch changes sync.

---

## 0. Mental model

- Officials **never create cases**. A case appears here only after citizens push community confidence **≥ 80%**.
- Officials **decide** (approve & assign, or reject with reason and proof), **execute** (start work, post updates, mark fixed with proof), and **watch** (SLA, reopened cases, hotspots, insights).
- **Only citizens can close a case**, by confirming the fix (25 confirms). **3 "not fixed"** reopens it automatically. Officials can't do either.
- Individual citizen identities are **never shown**; signals are aggregated.

### Government status (`GS` in `stage-style.ts`)
| Key | Label | Icon | Colour |
|---|---|---|---|
| pending | Pending approval | `ph-hourglass-medium` | marigold |
| assigned | Assigned | `ph-user-circle-check` | peacock |
| progress | In progress | `ph-hard-hat` | pulse |
| reopened | Reopened | `ph-arrow-counter-clockwise` | pulse-soft |
| fixed | Fixed · confirming | `ph-check` | leaf-soft |
| closed | Closed | `ph-seal-check` | leaf |
| rejected | Rejected | `ph-x-circle` | surface-2 |

Mapping from citizen stages:
- `review` → pending
- `assigned` → assigned
- `progress` → progress, or reopened if `reopened > 0`
- `resolved` → fixed
- `closed` → closed
- `rejected` → rejected

`overdue` is a derived filter: SLA passed on assigned, progress or reopened.

### Allowed transitions (`ALLOW`): enforce in UI **and** server
- pending → assigned (**Approve** modal) · pending → rejected (**Reject** modal)
- assigned → progress (direct, toast "Work started · citizens notified")
- progress → fixed (**Mark fixed** modal) · reopened → fixed (**Mark fixed** modal)
- Anything else is refused with a toast and a triple haptic:
  - → closed: "Only citizens can close a case — they confirm after you mark it fixed"
  - → reopened: "Cases reopen automatically when 3 citizens say it isn't fixed"
  - anything else: "Can't move a case from X to Y"

### SLA chips (per row)
- **pending:** decision SLA = `decisionSla` (config 24/48/72 h, default 48) from threshold crossing. Shows "Decide in 6h"; marigold-soft when < 12 h; pulse/white "Decision late 3h" when past.
- **assigned / progress / reopened:** `CP.slaLeft(i)`. Marigold-soft when at risk (< 24 h), pulse/white when overdue.
- Everything else: neutral.

### Priority score
`min(99, SEVW[sev] + conf*0.4 + min(sup,60)*0.3)`. This is the default sort everywhere.

---

## 1. Shell & navigation

### Responsive split
- **Desktop (≥ 720px):** left **rail** (always dark, collapsible via `prefs.railC`, width animates). It has the logo "KOODAL · GOVERNMENT", nav items, settings, and the official's avatar, name and title at the bottom.
- **Mobile (< 720px):** **top header** (`02-mobile-header`: title and subtitle per tab, avatar) plus **bottom nav** (`03-mobile-bottom-nav`). Modals become bottom sheets with drag-to-expand (`sheetDown`: tap toggles max, drag down > 70px closes, drag up expands).

### Nav items
`home` (`ph-house`), `cases` (`ph-folders`, badge = pending count), `map` (`ph-map-trifold`), `insights` (`ph-chart-line-up`), `search` (`ph-magnifying-glass`). Active item uses the **fill** weight. `settings` and `profile` are reached from the rail footer or avatar.

### Navigation rules
- `go(tab, filters?)` switches tab. It can pre-apply case filters, e.g. a KPI tile → `cases` with `cSt:['overdue']`.
- `open(id)` opens **case detail** and remembers `from`, so back returns to the originating tab (breadcrumb "{backL} / {ref}"). The rail keeps the originating tab highlighted.
- **Keyboard:** `/` anywhere (outside inputs) → Search. `Esc` closes everything: tour, date picker, combo-box, modal, popover, filter sheets, region picker, map selection.

### Global UI
- Toast, ripple, haptics (`buzz`, with patterns like `[8,30,8]` for success and `[20,40,20]` for refusals).
- Theme light/dark.
- Language **English / தமிழ்** for navigation and headings only. Case content stays in the language citizens used.
- Scope config: `scope` = Chennai / Coimbatore / Madurai / All (corporation label `corpL`).

---

## 2. Login (slice `00-login`)

**Desktop:** split layout.
- Left brand panel (dark): logo, "KOODAL · GOVERNMENT CONSOLE", headline "Every case here started with citizens.", explainer about the 80% threshold, a stats strip (`s.v` / `s.l`), and footer "Tamil Nadu Urban Local Bodies · Authorised officials only".
- Right: the form.

**Mobile:** form only, with a compact brand header.

| Step (`lstep`) | Shows | Actions |
|---|---|---|
| **id** | "Sign in to the console", "Use your corporation employee ID…", **Employee ID**, **Password**, error line `lerr`, **Continue**, **Sign in with department SSO**, language pills | Continue → validates, then otp. Empty or wrong fields show an inline error. |
| **otp** | "Enter the 6-digit code", "Sent to +91 •••• ••9204 for {empId}. Demo: any six digits.", 6 boxes, error | 6 digits → **Verify** → `authed:true` → Home. Back → id. |

**Firebase later:** employee ID + password → custom token via a function, then phone OTP as the second factor. Custom claims: `role:'gov'`, `city`, `dept`.

---

## 3. Home: dashboard (slice `10-dashboard`)

**Purpose:** what needs me today.

**Shows**
- Date line `todayL`, greeting **"Vanakkam, {first}"**, "{role} · {corpL}".
- Search box "Case ID, place, department… /", which goes to Search.
- **Alert banner** (only when overdue or reopened > 0): "{N} overdue · {M} reopened", "Citizens can see SLA breaches on the public case timeline.", **Review now** → cases filtered to overdue.
- **KPI tiles.** Each tile is clickable and goes to `cases` with the filter pre-set:
  - Pending approval (marigold)
  - Active cases (peacock-soft)
  - Overdue (pulse)
  - Reopened (pulse-soft)
  - Awaiting confirmation (leaf-soft)
  - Avg time to resolve (timer)
- **Needs your decision · {pendN}**: top 5 pending by score. Each row shows ref · meta, title, severity, "{sup} · {conf}%", SLA chip, and inline **Reject** (raised) + **Approve** (primary), which open the respective modals. The row body opens detail. **All pending** → cases filtered to pending. Empty state when none.
- **SLA risk** list: top 5 at-risk or overdue. Row → detail.
- **Trend** mini chart (cases per day).
- Layout: two columns on desktop (`1.55fr / 1fr`), one on mobile.

---

## 4. Cases (slice `11-cases`)

**Header:** "Cases", "Opened automatically when community support crosses the 80% threshold · {casesTotal} cases in {corpL}".

**Toolbar**
- View switcher (segmented, saved in `prefs.view`): **List** (`ph-rows`), **Grid** (`ph-squares-four`), **Board** (`ph-kanban`). Labels show on desktop only.
- **Filters {cfN}** opens the filter/sort sheet (`22`).
- Active filter chips `a.l` (removable) and **Clear all**.
- Result line: "{listN} shown · sorted by {sortL}{boardHint}".

**List view:** table with columns **Case · Status · Community · Department · Team · Target**. Rows show photo count, ref · meta, title, status pill, support/confidence, dept/team, and SLA chip. Row → detail.

**Grid view:** cards with the same data plus a photo.

**Board view (Kanban)**
- Columns: Pending → Assigned → In progress → Reopened → Fixed · confirming → Closed → Rejected. Each column has a count.
- **Drag & drop:** only draggable if `ALLOW[status]` exists (cursor grab; others pointer).
  - While dragging, the card goes to 45% opacity, rotates 2° and scales to .97, with a haptic.
  - Valid target columns highlight with the action label: "Drop to approve", "Drop to reject", "Drop to start work", "Drop to mark fixed".
  - Invalid columns show "No cases" / refuse.
  - Drop → `moveTo(id, col)`: opens the matching modal (approve, reject, fix) or sets status directly (start work).
- Empty column shows "Drop here" while a valid drag is active, otherwise "No cases".

**Filters** (`cSt`, `cCity`, `cArea`, `cDept`, `cCat`, `cq`, `sort`)
- Status options `STF`: All, Pending approval, Assigned, In progress, Reopened, Overdue, Fixed · confirming, Closed, Rejected.
- Sorts: priority score (default), newest, SLA, support, and the rest in `SORTS`.
- City, area, department and category are combo-boxes with search, live counts, "No matches" and **Clear**.
- Sheet footer: **Reset**, and **Show {N} cases**.

---

## 5. Case detail (slice `12-case-detail`): the decision hub

Header: breadcrumb **{backL} / {ref}**, **Copy link** (copies a deep link, toast).

**Left / main column**
1. **Photo gallery:** a mosaic with captions and **Show all {photoN} photos**. It opens a carousel with a "{carN} / {total}" counter, prev/next, swipe and Esc.
2. Status pill, severity, SLA chip, **Recurring** badge (if history), "{category} · {id}", title, place.
3. **Case lifecycle** stepper: each stage with its date (`s.l`, `s.date`).
4. **AI case summary** + `#tags`. "**Recurring location.** {history}" when applicable.
5. **Community signals:**
   - "{sup} citizens support this", "Crossed threshold {ago} ago", and a big **{conf}%**
   - stat tiles (`s.v` / `s.l`)
   - privacy note: "Individual citizen reports and identities are not shown to officials. Signals are aggregated and anonymised by Koodal."
6. **Evidence:** "{photoN} photos · geotagged within 50 m", a grid with caption and ago, and a "+N more" button (`moreP`).
7. **Timeline:** `events[]` with `e.t`, `e.s` and `e.date`, the same events citizens see.

**Right / action column** (sticky on desktop, bottom block on mobile). **Exactly one state**, by status:

| Status | Panel | Actions |
|---|---|---|
| **pending** | "Your decision · Approve or reject this case", "Community threshold crossed {ago} ago · decision due {decLeft}. Citizens see your decision on their case timeline." | **Approve & assign** (primary) → Approve modal · **Reject with reason** → Reject modal · **Schedule field inspection first** (tertiary, sets a note/event) |
| **assigned** | "Case management · Assigned to {assignee}", "{dept} · {prio} · {sla}" | **Start work on site** → status progress + toast · **Edit assignment** → Assign modal · **Post update** → Update modal |
| **reopened** | Alert: "Reopened by citizens. {disputes} said the fix was incomplete. Fix again and attach new proof." plus the progress panel | same as progress |
| **progress** | "Work in progress · {assignee}", "{dept} · {prio} · {sla}" | **Mark as fixed** (primary) → Fix modal · **Edit assignment** · **Post update** |
| **fixed** | "Citizens are confirming", progress "{confirms} of {needed} confirmed fixed", "{confirms} say fixed · {disputes} say not fixed", "Closes automatically at {needed} confirmations. Reopens if 3 citizens say it isn't fixed. Officials can't close cases directly." | **Post update** only |
| **closed** | "Closed by citizens · {confirms} of {needed} confirmed the fix", "Resolved in {resTime} · {assignee}" | none (read-only) |
| **rejected** | "Rejected · {reason}", note, "Reference · {ref}", proof list, "Reason and proof are visible to citizens who supported this case." | none |

Below the panel is a **Case facts** list (`f.k` / `f.v`: dept, team, officer, target, created, ward…) and a **View on map** link → `map` with this pin selected.

---

## 6. Action modals (slice `23-action-modals`)

**Shared shell**
- Header shows `mc.ref`, `mc.title`, `mc.case`, and a close button.
- Desktop: centred modal, which can be enlarged (`mBig`). Mobile: bottom sheet.
- Footer: **Cancel**, plus the primary **{ctaL}**. The primary stays disabled until required fields are valid.
- A "{visible}" line under the fields tells the official what citizens will see.
- On success: close, toast, haptic `[8,30,8]`, and the list/detail update instantly. The citizen app shows the new timeline event in real time.

| Modal | Fields | Server action & result |
|---|---|---|
| **approve** · Approve & assign | Department (combo-box with search, prefilled from category), Team (prefilled), **Target date** (quick picks e.g. +2d / +5d / +7d, plus an inline calendar `mc.cal`, relative label), optional note. A preview line summarises "{dept}{team}{date}". | `A.approve` → status **assigned**; creates **CP-{CITY}-{seq}**; timeline events "Approved", "Assigned to …", optional note. Toast "Case approved · CP-…". |
| **reject** · Reject with reason | **Reason · required**, one of `REASONS`: Duplicate of an existing case (`ph-copy`), Outside our jurisdiction (`ph-map-trifold`), On private property (`ph-house-line`), Already resolved on inspection (`ph-check-square`), Not a civic issue (`ph-prohibit`), Evidence does not match site (`ph-image-broken`). **Reference case ID** is required when the reason is Duplicate. **Explanation · required**, placeholder "Explain what the inspection found, in plain words citizens will understand." **Supporting proof · required**: add a Site photo and/or Document. | `A.rejectCase` → **rejected**; citizens see reason, note, proof and ref. |
| **assign** · Edit assignment | Department, Team, Target date (same controls as approve) | `A.editAssign` → timeline "Reassigned…" / "Target moved to…" |
| **update** · Post update | Note (required), optional photo | `A.note` → timeline event visible to citizens |
| **fix** · Mark as fixed | **Proof photos · required** (after-photos, geotag check), note | `A.markFixed` → **fixed**; citizens asked to confirm (starts the 25-confirm / 3-dispute loop) |

---

## 7. Map (slice `13-map`)

- Header: `regionTitle` (city), "{mapPinN} cases", `regionSub`. A region picker switches between Chennai, Coimbatore and Madurai.
- **Map** (drawn, `--cp-map*`): pan, wheel/pinch zoom, and `+` / `−` / recenter controls.
- Layers (toggles in the filter sheet "Show on map"):
  - **Cases:** pins coloured by GS status.
  - **Hotspots:** area circles with counts (`h.area`).
  - **Emerging:** pre-threshold clusters with `cp-ping` and a count (`e.n`), hidden when `showEmerging` = false.
- Filters: status (`mSt`), area, dept and category (same combo-boxes). Empty state: "No cases match these filters."
- **Pin click** → `mapSel` shows a preview card (ref · meta, title, short status, support, SLA) with **Open case** → detail.
- **List panel:** a side list on desktop; on mobile a bottom sheet (`mListOpen`, draggable) listing the visible pins. Row → select pin / open.

---

## 8. Insights (slice `14-insights`)

- Header: "Insights", "{rangeL} · {recN} cases · compared with the previous period", **Export CSV**.
- **When:** range pills 7d / 30d / 90d / custom. Custom opens the **Date range picker** (`20`):
  - quick ranges (`t.l`) and a two-month calendar (`m.title`, weekdays, days)
  - from/to boxes (`bx.l` / `bx.v`)
  - "How far back should we look?" quick lookbacks
  - "Or pick whole months" chips
  - hint, **Clear**, **Apply**
- Filter combo-boxes: city, area, dept, category, plus **Reset filters**.
- **Metric tabs** (`metric`): overview, received, resolved, SLA, reopened, and the rest in the prototype.
- Chart type: **bars / line** (`chartT`). Hover a bar (`hB`) for a tooltip. Series toggles.
- **Department table** sortable by `dSort`: cases, resolved %, avg time, overdue, reopened.
- All numbers recompute from the filtered set. The comparison uses the previous equal-length period.

---

## 9. Search (slice `15-search`)

- Big input (auto-focus; `/` shortcut). **Filters {cfN}** plus chips and Clear all.
- Empty query shows **Recent** searches (click to rerun) and **Try** suggestions.
- With a query:
  - "{sCount}" results
  - **Areas & departments** group ("{n} cases", click → cases filtered)
  - case rows ("{ref} · {street} · {dept}", title, short status) → detail
- No results: "No cases match "{sq}". Only community-created cases are searchable here."

---

## 10. Profile (slice `16-profile`) & Settings (slice `17-settings`)

**Profile**
- Avatar, name, "{title} · {role}", "{dept} · {corpL}", **Verified official**.
- KPI tiles (`k.v` / `k.l` / `k.s`): my decisions, fixed, avg time.
- Facts (`f.k` / `f.v`), **Assigned area** "{zone}" with area chips and counts.
- Link to Settings.

**Settings**
- **Notifications:** toggles (`n.l` / `n.s`: new pending, SLA risk, reopened, citizen disputes…) and "Deliver via" chips (`c.l`: App, SMS, Email).
- **Language:** English / தமிழ் pills, with the note "Navigation and headings. Case content stays in the language citizens used."
- **Security:**
  - Two-step verification ("OTP to +91 •••• ••9204 at every sign-in. Required by your department." · On, locked)
  - Auto sign-out after inactivity (options)
  - **Active sessions** (this device, plus others with **Sign out**)
  - Password → Change password
- **Account:** facts, and **Sign out** → login.

---

## 11. Product tour (slice `21-product-tour`)
First-login walkthrough (`tour`): steps highlight dashboard, cases board, case decision and map, with next/back/skip. Esc closes. Show it once per official and store the flag in prefs.

## 12. Filter / sort sheet (slice `22-filter-sort-sheet`)
One component reused by cases, map and search (`fs.eyebrow`, `fs.title`):
- the "Show on map" layers section (map only)
- **Status** with hint and counts
- combo-box filters and sort options
- footer: Reset, and **Show N cases** / **Show results**

---

## 13. Real-time & cross-app contract
- Every screen reads from one store subscription (`CP.subscribe` now, Firestore `onSnapshot` later). Citizen actions (support, confirm, dispute) update gov counts, KPIs, confidence and board columns live, and gov actions show up in the citizen timeline live.
- Server actions validate `ALLOW` and the official's `city`/`dept` claims. Never trust the client.
- All gov actions append events to `issues/{id}/events` with actor = department, never the official's personal info on the public timeline.
- FCM notifies supporters on approve, reject, start work, update and mark fixed. Officials are notified on new pending, SLA risk, reopened and disputes, per their settings.

---

## 14. End-to-end journeys to test (desktop 1440×900 and mobile 390×844, both themes)
1. **Login:** wrong password shows the error → correct → OTP → dashboard. Esc and `/` shortcuts work.
2. **Decide from home:** Needs your decision → **Approve** → pick dept/team/date → case gets a CP-ID and moves to Assigned; KPI counts update.
3. **Reject:** pending case → Reject → pick "Duplicate…" (ref required) → note + proof → Rejected. The citizen app shows "Not accepted".
4. **Board drag:** Board view → drag pending → Assigned (approve modal) → drag assigned → In progress (toast) → drag → Fixed (fix modal). An invalid drop (→ Closed) shows the refusal toast.
5. **Execute:** assigned case → Start work → Post update → Mark as fixed with proof → "Citizens are confirming".
6. **Citizen loop (two tabs):** citizen confirms fixed ×25 → gov shows Closed. Or 3 × not fixed → gov shows Reopened with the alert.
7. **Overdue:** Home alert → Review now → Cases filtered to overdue → open → Edit assignment (new target).
8. **Map:** switch city → toggle layers → click pin → preview → Open case → back returns to map.
9. **Insights:** 30d → custom range → metric SLA → line chart → sort dept table → Export CSV.
10. **Search:** `/` → "Velachery" → area group → cases filtered. Nonsense query shows the empty state.
11. **Settings:** switch to தமிழ் (nav and headings change, case content doesn't) → dark theme → collapse rail → reload (prefs persist).

For each journey, screenshot every step and compare with the prototype at the same step. Fix differences before moving on.

---

## How to run this with Claude Code
Port one slice per session, using this doc as the map:
```
Read design_handoff_koodal/prompts/gov-flow.md (sections 0, 1 and <N>) and port slice screens/gov/<NN-name>/. Wire every action, transition rule and navigation exactly as described there and in screens/gov/_shared/methods.js. Follow CLAUDE_CODE_PROMPT.md hard rules. Diff until < 1% against the slice's screenshots, then run the matching journey from section 14 and report.
```
Suggested order: `00-login` → `01`/`02`/`03` chrome → `10-dashboard` → `11-cases` → `12-case-detail` → `23-action-modals` → `22-filter-sort-sheet` → `13-map` → `14-insights` + `20-date-range-picker` → `15-search` → `16-profile` → `17-settings` → `21-product-tour`.
