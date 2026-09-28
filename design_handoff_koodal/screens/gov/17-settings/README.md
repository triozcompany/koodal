# Settings

Source: `Koodal Government.dc.html`, block `<sc-if value="{{ isSettings }}">`.

## Match these screenshots
- ![](../../../screenshots/gov-desktop/21-settings.png) `screenshots/gov-desktop/21-settings.png`

## Values used (from renderVals)
`isSettings`, `pad`, `h1`, `tr`, `notifs`, `chans`, `setCols`, `langOpts`, `toOpts`, `sessions`, `changePwd`, `acctInfo`, `exportLog`, `signOut`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
