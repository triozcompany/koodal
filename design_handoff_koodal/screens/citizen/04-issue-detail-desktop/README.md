# Issue detail (desktop)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ deskDetail }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-desktop/05-issue-detail.png) `screenshots/citizen-desktop/05-issue-detail.png`

## Values used (from renderVals)
`deskDetail`, `back`, `backLabel`, `d`, `detailCols`, `galH`, `mosaic`, `openTour`, `addEvidence`, `openComments`, `meI`, `cDraft`, `onCDraft`, `onCKey`, `sendC`, `cSendO`, `asidePos`, `goCase`, `editFlex`, `isMobile`, `shareFlex`, `oppFlex`, `holdStart`, `holdEnd`, `holdFlex`, `holdBg`, `holdFg`, `holdShadow`, `holdT`, `holdW`, `holdIcon`, `holdLabel`, `goVerify`, `events`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
