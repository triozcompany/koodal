# Search (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isSearch }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/04-search.png) `screenshots/citizen-mobile/04-search.png`

## Values used (from renderVals)
`isSearch`, `qRef`, `q`, `onQ`, `clearQ`, `openDrawer`, `meI`, `meVerified`, `openFilters`, `fN`, `toggleSort`, `sortL`, `sortRot`, `activeF`, `sortOpen`, `closeSort`, `sddL`, `sortOpts`, `showIdle`, `sPad`, `topTags`, `qSuggest`, `tileCols`, `latestNear`, `showRes`, `qCount`, `hasSC`, `sCN`, `gridCols`, `sCases`, `hasSR`, `sRN`, `sReports`, `qNone`, `goReport`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
