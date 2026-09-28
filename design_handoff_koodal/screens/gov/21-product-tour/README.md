# Product tour

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ tourOpen }}">`.

## Match these screenshots
- none captured — the markup is the spec

## Values used (from renderVals)
`tourOpen`, `closeTour`, `d`, `tourPad`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
