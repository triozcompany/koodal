# Case timeline (mobile; desktop merges into detail)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isTimeline }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/12-timeline.png) `screenshots/citizen-mobile/12-timeline.png`

## Values used (from renderVals)
`isTimeline`, `goDetail`, `d`, `events`, `goVerify`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
