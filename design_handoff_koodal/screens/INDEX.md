# Screen slices

Each folder = one screen or overlay, cut verbatim from the prototype so you can port it with a small context.

Per folder:
- `markup.html` — exact template for this screen (inline styles, `{{ value }}` holes, `<sc-if>`/`<sc-for>`).
- `logic.js` — the lines of `renderVals()` that compute this screen\'s values (line numbers point into `../_shared/render-vals.js`).
- `README.md` — what it is, screenshots to match, values & handlers it uses.

Shared per app in `_shared/`: `helmet.html` (fonts, icon CSS, CSS variables, keyframes — copy verbatim to globals.css), `constants.js`, `methods.js` (event handlers, gestures, navigation), `render-vals.js` (full value computation), `shell.html` (the whole template with each screen replaced by a `<!-- SLICE: … -->` marker — shows how screens nest and which wrapper/stage they sit in).

Data + business rules: `../design/civicpulse-data.js`.

## Koodal Citizen

- `citizen/00-desktop-rail/` — Desktop left navigation rail · 7 screenshot(s) · 3,833 chars
- `citizen/01-home-desktop/` — Home: map + nearby list (desktop) · 2 screenshot(s) · 13,366 chars
- `citizen/02-feed-desktop/` — Feed (desktop) · 1 screenshot(s) · 11,636 chars
- `citizen/03-search-desktop/` — Search (desktop) · 1 screenshot(s) · 17,772 chars
- `citizen/04-issue-detail-desktop/` — Issue detail (desktop) · 1 screenshot(s) · 24,771 chars
- `citizen/05-cases-desktop/` — Cases (desktop) · 1 screenshot(s) · 10,546 chars
- `citizen/06-profile-desktop/` — Profile (desktop) incl. edit-profile panel · 1 screenshot(s) · 25,221 chars
- `citizen/07-settings-desktop/` — Settings (desktop) · 1 screenshot(s) · 10,729 chars
- `citizen/10-home-mobile/` — Home: map + draggable bottom sheet (mobile) · 1 screenshot(s) · 12,797 chars
- `citizen/11-feed-mobile/` — Feed (mobile) · 1 screenshot(s) · 10,602 chars
- `citizen/12-search-mobile/` — Search (mobile) · 1 screenshot(s) · 18,839 chars
- `citizen/13-issue-detail-mobile/` — Issue detail (mobile) · 1 screenshot(s) · 20,357 chars
- `citizen/14-report-capture/` — Report: camera / upload, text or voice, tags, anonymous, slide to report · 2 screenshot(s) · 13,690 chars
- `citizen/15-ai-analysis-desktop/` — AI analysis (desktop) · 1 screenshot(s) · 5,210 chars
- `citizen/16-ai-analysis-mobile/` — AI analysis (mobile) · 2 screenshot(s) · 3,940 chars
- `citizen/17-similar-mobile/` — Duplicate found → join (mobile) · 1 screenshot(s) · 5,151 chars
- `citizen/18-similar-desktop/` — Duplicate found → join (desktop) · 1 screenshot(s) · 5,231 chars
- `citizen/19-threshold-desktop/` — Community-verified celebration at 80% (desktop) — no screenshot, follow markup · 7,495 chars
- `citizen/20-threshold-mobile/` — Community-verified celebration at 80% (mobile) — no screenshot, follow markup · 2,129 chars
- `citizen/21-official-case/` — Official case view · 2 screenshot(s) · 8,535 chars
- `citizen/22-timeline/` — Case timeline (mobile; desktop merges into detail) · 1 screenshot(s) · 4,121 chars
- `citizen/23-verify-fix/` — Is it fixed? confirm / not fixed · 2 screenshot(s) · 11,454 chars
- `citizen/24-cases-mobile/` — Cases: following / my reports (mobile) · 1 screenshot(s) · 10,619 chars
- `citizen/25-profile-mobile/` — Profile (mobile) · 1 screenshot(s) · 25,616 chars
- `citizen/26-settings-mobile/` — Settings (mobile) · 1 screenshot(s) · 11,129 chars
- `citizen/27-tab-bar-mobile/` — Bottom tab bar (mobile) · 5 screenshot(s) · 2,102 chars
- `citizen/30-filters/` — Filters sheet / panel · 2 screenshot(s) · 5,847 chars
- `citizen/31-location-picker-desktop/` — Where to explore — area picker (desktop) · 3,529 chars
- `citizen/32-location-picker-mobile/` — Where to explore — area picker (mobile) · 2,707 chars
- `citizen/33-photo-viewer/` — Report photos viewer · 3,184 chars
- `citizen/34-comments/` — Comments sheet · 3,335 chars
- `citizen/35-edit-report/` — Edit / delete report sheet · 6,921 chars
- `citizen/36-profile-drawer/` — Profile drawer · 2,905 chars
- `citizen/37-report-fab/` — Floating report button · 1 screenshot(s) · 666 chars
- `citizen/38-sign-in-onboarding/` — Sign-in & onboarding: intro → phone → OTP → Aadhaar → profile → permissions · 14,700 chars

Shell size: 5,021 chars

## Koodal Government

- `gov/00-login/` — Login: employee ID → OTP · 3 screenshot(s) · 8,028 chars
- `gov/01-desktop-rail/` — Desktop left navigation rail · 5 screenshot(s) · 3,943 chars
- `gov/02-mobile-header/` — Mobile top header · 2 screenshot(s) · 2,492 chars
- `gov/03-mobile-bottom-nav/` — Mobile bottom navigation · 2 screenshot(s) · 1,030 chars
- `gov/10-dashboard/` — Dashboard · 2 screenshot(s) · 14,714 chars
- `gov/11-cases/` — Cases: grid / board (drag) / list · 4 screenshot(s) · 19,314 chars
- `gov/12-case-detail/` — Case detail — every stage (pending, assigned, in progress, fixed, closed, rejected) · 4 screenshot(s) · 24,899 chars
- `gov/13-map/` — Map incl. area/region picker · 3 screenshot(s) · 20,624 chars
- `gov/14-insights/` — Insights · 2 screenshot(s) · 23,487 chars
- `gov/15-search/` — Search · 1 screenshot(s) · 7,003 chars
- `gov/16-profile/` — Profile · 1 screenshot(s) · 4,116 chars
- `gov/17-settings/` — Settings · 1 screenshot(s) · 8,022 chars
- `gov/20-date-range-picker/` — Date range picker (insights) · 6,298 chars
- `gov/21-product-tour/` — Product tour · 2,240 chars
- `gov/22-filter-sort-sheet/` — Filter / sort / map layers sheet · 10,476 chars
- `gov/23-action-modals/` — Modals: approve & assign, reject, edit assignment, post update, mark fixed · 6 screenshot(s) · 13,923 chars

Shell size: 1,518 chars

