# Insights

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ isIns }}">`.

## Match these screenshots
- ![](../../../screenshots/gov-desktop/18-insights.png) `screenshots/gov-desktop/18-insights.png`
- ![](../../../screenshots/gov-mobile/07-insights.png) `screenshots/gov-mobile/07-insights.png`

## Values used (from renderVals)
`isIns`, `pad`, `h1`, `tr`, `ins`, `insTop`, `insZ`, `dp`, `cbMin`, `kpiMin`, `chartH`, `insCols`, `listCards`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
