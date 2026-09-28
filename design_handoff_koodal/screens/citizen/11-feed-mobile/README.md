# Feed (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isFeed }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/03-feed.png) `screenshots/citizen-mobile/03-feed.png`

## Values used (from renderVals)
`isFeed`, `openDrawer`, `meI`, `meVerified`, `postGap`, `feedPosts`, `postR`, `postB`, `postSh`, `stop`, `cDraft`, `onCDraft`, `onCKey`, `sendC`, `cSendO`, `feedEmpty`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
