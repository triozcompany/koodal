# Bottom tab bar (mobile)

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ showTabs }}">`.

## Match these screenshots
- ![](../../../screenshots/citizen-mobile/01-home-map.png) `screenshots/citizen-mobile/01-home-map.png`
- ![](../../../screenshots/citizen-mobile/03-feed.png) `screenshots/citizen-mobile/03-feed.png`
- ![](../../../screenshots/citizen-mobile/04-search.png) `screenshots/citizen-mobile/04-search.png`
- ![](../../../screenshots/citizen-mobile/13-my-cases.png) `screenshots/citizen-mobile/13-my-cases.png`
- ![](../../../screenshots/citizen-mobile/14-profile.png) `screenshots/citizen-mobile/14-profile.png`

## Values used (from renderVals)
`showTabs`, `tabsL`, `goReport`, `tabsR`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
