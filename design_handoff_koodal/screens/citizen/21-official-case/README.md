# Official case view

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isCase }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/11-official-case.png) `screenshots/citizen-mobile/11-official-case.png`
- ![](../../../screenshots/citizen-desktop/10-official-case.png) `screenshots/citizen-desktop/10-official-case.png`

## Values used (from renderVals)
`isCase`, `goDetail`, `flowBackIcon`, `d`, `stamp`, `toggleNotify`, `notifyBg`, `notifyT`, `events`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
