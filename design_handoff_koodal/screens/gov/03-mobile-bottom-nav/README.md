# Mobile bottom navigation

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ mobChrome }}">`.

## Match these screenshots
- ![](../../../screenshots/gov-mobile/02-dashboard.png) `screenshots/gov-mobile/02-dashboard.png`
- ![](../../../screenshots/gov-mobile/03-cases.png) `screenshots/gov-mobile/03-cases.png`

## Values used (from renderVals)
`mobChrome`, `nav`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
