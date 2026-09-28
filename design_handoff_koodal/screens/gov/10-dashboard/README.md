# Dashboard

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ isHome }}">`.

## Match these screenshots
- ![](../../../screenshots/gov-desktop/03-dashboard.png) `screenshots/gov-desktop/03-dashboard.png`
- ![](../../../screenshots/gov-mobile/02-dashboard.png) `screenshots/gov-mobile/02-dashboard.png`

## Values used (from renderVals)
`isHome`, `pad`, `todayL`, `h1`, `me`, `corpL`, `notMob`, `goSearch`, `hasAlert`, `alertT`, `alertS`, `goOverdue`, `kpiMin`, `kpis`, `homeCols`, `pendN`, `goPending`, `pendRows`, `pendEmpty`, `riskN`, `riskRows`, `riskEmpty`, `trend`, `goMap`, `hotMini`, `hotRows`, `activity`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
