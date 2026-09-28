# Feed (desktop)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ deskFeed }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-desktop/03-feed.png) `screenshots/citizen-desktop/03-feed.png`

## Values used (from renderVals)
`deskFeed`, `feedCols`, `postGap`, `feedPosts`, `postR`, `postB`, `postSh`, `stop`, `meI`, `cDraft`, `onCDraft`, `onCKey`, `sendC`, `cSendO`, `feedEmpty`, `feedSide`, `trending`, `topTags`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
