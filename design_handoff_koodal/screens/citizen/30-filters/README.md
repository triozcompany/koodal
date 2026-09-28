# Filters sheet / panel

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ mFilterOpen }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/02-home-filters.png) `screenshots/citizen-mobile/02-home-filters.png`
- ![](../../../screenshots/citizen-desktop/14-filters.png) `screenshots/citizen-desktop/14-filters.png`

## Values used (from renderVals)
`mFilterOpen`, `isMobile`, `closeFilter`, `shTop`, `shMax`, `shR`, `closeCombos`, `combos`, `sheetGroups`, `clearFilters`, `fBtnL`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
