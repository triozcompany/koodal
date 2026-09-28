# Duplicate found → join (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isSimM }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/09-similar-duplicate.png) `screenshots/citizen-mobile/09-similar-duplicate.png`

## Values used (from renderVals)
`isSimM`, `goAiBack`, `flowBackIcon`, `simTitle`, `mineT`, `mineO`, `mineTag`, `theirsT`, `m`, `joining`, `badgeBg`, `badgeO`, `simOthers`, `simPrimary`, `simPIcon`, `simPLabel`, `simSecondary`, `simSLabel`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
