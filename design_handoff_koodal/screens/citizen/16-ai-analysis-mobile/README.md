# AI analysis (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isAiM }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/07-ai-analysis-running.png) `screenshots/citizen-mobile/07-ai-analysis-running.png`
- ![](../../../screenshots/citizen-mobile/08-ai-analysis-result.png) `screenshots/citizen-mobile/08-ai-analysis-result.png`

## Values used (from renderVals)
`isAiM`, `aiTitle`, `aiScanning`, `aiBox`, `an`, `aiRows`, `aiThinking`, `aiDone`, `aiNext`, `aiBtnBg`, `aiBtnFg`, `aiBtnIcon`, `aiBtnLabel`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
