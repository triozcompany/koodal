# Settings (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ isSettings }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/15-settings.png) `screenshots/citizen-mobile/15-settings.png`

## Values used (from renderVals)
`isSettings`, `goProfilePage`, `meI`, `meName`, `mePhone`, `meArea`, `togglePEdit`, `pEditIcon`, `pEditL`, `pEditOpen`, `pName`, `onPName`, `pArea`, `onPArea`, `saveProfile`, `setToggles`, `langSeg`, `verifiedLine`, `helpT`, `aboutT`, `deleteAcct`, `logout`, `resetDemo`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
