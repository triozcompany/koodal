# Cases: following / my reports (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isCases }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/13-my-cases.png) `screenshots/citizen-mobile/13-my-cases.png`

## Values used (from renderVals)
`isCases`, `openDrawer`, `meI`, `meVerified`, `cTabs`, `cQ`, `onCQ`, `clearCQ`, `openCaseFilters`, `fN`, `cycleCSort`, `cSortL`, `cShownN`, `cViews`, `cvList`, `caseRows`, `cvGrid`, `gridCols`, `casesEmpty`, `casesEmptyTxt`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
