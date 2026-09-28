# Case detail — every stage (pending, assigned, in progress, fixed, closed, rejected)

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ isCase }}">`.

## Match these screenshots
- ![](../../../screenshots/gov-desktop/08-case-pending-review.png) `screenshots/gov-desktop/08-case-pending-review.png`
- ![](../../../screenshots/gov-desktop/09-case-in-progress.png) `screenshots/gov-desktop/09-case-in-progress.png`
- ![](../../../screenshots/gov-desktop/10-case-fixed-awaiting-confirm.png) `screenshots/gov-desktop/10-case-fixed-awaiting-confirm.png`
- ![](../../../screenshots/gov-mobile/04-case-detail.png) `screenshots/gov-mobile/04-case-detail.png`

## Values used (from renderVals)
`isCase`, `pad`, `notMob`, `back`, `backL`, `d`, `copyLink`, `detailCols`, `galH`, `mob`, `carN`, `h1d`, `asidePos`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
