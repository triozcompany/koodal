Port the **Citizen Issue Detail** page, desktop and mobile, with every action and overlay. This is a port, not a redesign: follow the hard rules in `design_handoff_koodal/CLAUDE_CODE_PROMPT.md` and icons per `design_handoff_koodal/ICONS.md`.

## Read first (only these)
- `screens/citizen/04-issue-detail-desktop/` — desktop page (markup.html, logic.js, README.md)
- `screens/citizen/13-issue-detail-mobile/` — mobile page
- `screens/citizen/33-photo-viewer/` — full-screen photo viewer
- `screens/citizen/34-comments/` — comments sheet (mobile) / inline comments (desktop)
- `screens/citizen/35-edit-report/` — edit + delete report sheet
- `screens/citizen/_shared/methods.js` — handlers named below
- `design/civicpulse-data.js` — actions `A.support`, `A.unsupport`, `A.oppose`, `A.evidence`, `A.removeEvidence`, `A.comment`, `A.share`, `A.editReport`, `A.deleteReport`
- Screenshots: `screenshots/citizen-desktop/05-issue-detail.png`, `screenshots/citizen-mobile/05-issue-detail.png`

## Route & layout
- Route `/issue/[id]`. Show the desktop slice at ≥ 720px wide and the mobile slice below that (same breakpoint as the prototype's `isMobile` / `w>=720`).
- Desktop: inside the existing left rail layout (`00-desktop-rail`), with breadcrumb "Nearby / CP-xxxx", a two-column body, and a sticky action panel on the right. The timeline is merged into this page on desktop; `go('timeline')` redirects to detail.
- Mobile: full-screen page with a back button, photos on top, and a sticky bottom action bar.

## Everything on the page (port each block exactly as in markup)
1. **Header**: back (`back`), breadcrumb/ID, **Edit** (`d.edit`, only if `d.canEdit`), **Share** (`d.share` → `A.share`; use `navigator.share` with a copy-link fallback and toast), tour/help (`openTour`).
2. **Photos**: gallery with "· N photo" count, striped placeholders when there's no image, and **Show all N photos**. Clicking a photo opens **Photo viewer** (`33`) with `rpPrev` / `rpNext` / `closeRp`, keyboard ← → Esc, and swipe on mobile.
3. **Title block**: stage pill (from `stage-style.ts`), 5-segment progress track, severity, category, area, and time. The author row shows **Anonymous** when `d.anon`, plus a verified badge when `d.verified`.
4. **Description**: text (`d.hasText`) and **voice note** (`d.voice`: play button, waveform, duration, "Voice ·" label, plus English translation).
5. **Tags** (`d.hasTags`).
6. **AI summary** card ("AI SUMMARY ·") with **N similar reports combined** (`d.mergedN`).
7. **Community stats**: "citizens support this", "added evidence", "photos", "say not an issue".
8. **Case banner** (the states are mutually exclusive, keep them exactly):
   - `d.preCase`: community confidence bar towards 80% (Sent to govt).
   - `d.caseId`: **OFFICIAL CASE · CP-XXX-NNN**, with department, officer and due date, plus **Track official case** (`goCase`).
   - `d.rejected`: **Not accepted by {corp} ·** with the reason, note and reference.
   - `d.hasLinked`: **Reports in this case**, a list of linked reports (`lk.open`).
9. **Evidence**: "photos · people" count, a grid of evidence items, **Add** (`addEvidence` → `A.evidence`, needs identity), and remove own (`e.mine` → `e.rm` → `A.removeEvidence`). The **Edit report** entry point is here too when `d.canEdit`.
10. **Comments**:
   - Desktop: an inline list (anonymous comments show a masked name), the empty state "No comments yet. Be the first.", **Show more** (`d.cmtMore`), and an input (`onCDraft`, `onCKey` Enter to send, `sendC` → `A.comment`).
   - Mobile: a comments button (`d.commentBtn` / `openComments`) opens the **Comments sheet** (`34`).
11. **Timeline** (desktop inline, "Timeline · N updates"): events with `e.line`, `e.live` pulse and `e.sub`, in the same order and with the same icons as `events[]`.
12. **Action area** (sticky panel on desktop, bottom bar on mobile). Exactly one state is shown:
   - `d.actSupport`: **hold-to-support** vote button (`holdStart`: press-and-hold with progress ring, haptic, spring animation → `A.support`; tap again → `A.unsupport`) plus **Not an issue** (`d.oppose` → `A.oppose`, hidden for the author).
   - `d.actMine`: your own report, with support count and edit shortcut.
   - `d.lockedMine`: **With government · locked**, so editing is disabled.
   - `d.actCase`: **Track official case** (`goCase`).
   - `d.actVerify`: **Check the fix** (`goVerify` → verify screen).
   - `d.actDone`: closed state.
13. **Edit report sheet** (`35`): title, description, your photos (remove `im.remove`, **Add** `addEImg`), tags (add with Enter or `addETag`, remove `t.remove`), **Save changes** (`saveEdit` → `A.editReport`), and **Delete** → confirm step ("Keep it" / "Delete report" → `A.deleteReport` → back to feed with a toast). It's a bottom sheet on mobile and a side panel on desktop, exactly as the markup `isMobile` branches.

## Rules for actions
- All mutations go through `lib/store` (the mock port of `civicpulse-data.js`) for now. Keep the same side effects: confidence changes, the stage move at ≥ 80%, and timeline events. Firestore comes in phase 7.
- Actions needing a verified user (support, oppose, evidence, comment) open the phone-OTP identity sheet first, as in the prototype.
- Toasts, ripple, haptics and press states exactly as the prototype.

## Test states (seed IDs from the prototype data)
Screenshot each at 1440×900 and 390×844, in light and dark:
- `CP-2107`: community stage, support action
- A report by the current user: `actMine` and the edit sheet
- `CP-2089`: with govt (preCase ≥ 80%)
- `CP-2064`: official case banner, track case
- `CP-2045`: fixed, **Check the fix**
- A rejected issue: not-accepted banner
- An issue with merged reports: AI summary with N combined, plus "Reports in this case"

Diff against `screenshots/citizen-desktop/05-issue-detail.png` and `screenshots/citizen-mobile/05-issue-detail.png` until the difference is under 1%. For the other states, compare side by side with the prototype (`npx serve design_handoff_koodal/design`, open `Koodal Citizen.dc.html?screen=detail&cur=<id>`). Report the % for each and stop.
