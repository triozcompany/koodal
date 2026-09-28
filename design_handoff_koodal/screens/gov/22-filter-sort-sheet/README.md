# Filter / sort / map layers sheet

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ fsOpen }}">`.

## Match these screenshots
- none captured — the markup is the spec

## Values used (from renderVals)
`fsOpen`, `fs`, `fsScrim`, `fsL`, `fsR`, `fsT`, `fsB`, `fsW`, `fsHt`, `fsMaxH`, `fsRad`, `fsAnim`, `mob`, `fsScroll`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
