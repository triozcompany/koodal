# Home: map + draggable bottom sheet (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isHome }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/01-home-map.png) `screenshots/citizen-mobile/01-home-map.png`

## Values used (from renderVals)
`isHome`, `mapH`, `mapDown`, `mapWheel`, `mapCur`, `panX`, `panY`, `zoom`, `mapTr`, `showMe`, `mpins`, `pinInv`, `toggleMapFull`, `mapFullTip`, `mapFullIcon`, `zoomIn`, `zoomOut`, `recenter`, `hasMSel`, `msel`, `closeMSel`, `regionPill`, `regionName`, `openDrawer`, `meI`, `meVerified`, `sheetGone`, `showSheet`, `listCount`, `sheetTopPx`, `sheetTrans`, `sheetDown`, `chips`, `sheetScroll`, `sheetWheel`, `list`, `listEmpty`, `clearFilters`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
