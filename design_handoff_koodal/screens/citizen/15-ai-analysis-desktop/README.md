# AI analysis (desktop)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isAiD }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-desktop/07-ai-analysis.png) `screenshots/citizen-desktop/07-ai-analysis.png`

## Values used (from renderVals)
`isAiD`, `aiScanning`, `aiBox`, `an`, `shotList`, `closeFlow`, `aiTitle`, `aiRows`, `aiThinking`, `aiDone`, `aiNext`, `aiBtnIcon`, `aiBtnLabel`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
