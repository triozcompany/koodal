# Duplicate found → join (desktop)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isSimD }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-desktop/08-similar-duplicate.png) `screenshots/citizen-desktop/08-similar-duplicate.png`

## Values used (from renderVals)
`isSimD`, `closeFlow`, `simTitle`, `mineTag`, `m`, `joining`, `simOthers`, `simSecondary`, `simSLabel`, `simPrimary`, `simPIcon`, `simPLabel`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
