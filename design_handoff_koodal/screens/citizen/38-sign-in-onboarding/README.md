# Sign-in & onboarding: intro → phone → OTP → Aadhaar → profile → permissions

Source: `Koodal Citizen.dc.html`, block `<sc-if value="{{ authOpen }}">`.

## Match these screenshots
- none captured — the markup is the spec

## Values used (from renderVals)
`authOpen`, `auCols`, `isDesk`, `auSlides`, `auPad`, `auCanBack`, `auBack`, `auProg`, `auIntro`, `auSkip`, `auSlideK`, `auArt`, `auS`, `auPhone`, `auPhoneT`, `auPhBd`, `auPh`, `onAuPh`, `auPhOk`, `auFillPh`, `auOtp`, `auPhF`, `otpBoxes6`, `auOtpNote`, `auAad`, `auAdBd`, `auAdF`, `onAuAd`, `auFillAd`, `auToggleConsent`, `auCBd`, `auCBg`, `auCO`, `auAdOk`, `auProf`, `auInit`, `auName`, `onAuName`, `auArea`, `onAuArea`, `auAreas`, `auToggleAnon`, `auAnonBg`, `auAnonT`, `auPerm`, `auSecL`, `auSec`, `auPri`, `auPriO`, `auBusy`, `auPriL`, `auLegal`

## Port rules
- Convert `markup.html` to JSX nearly 1:1. Keep every inline style value; `style-hover`/`style-active` → :hover/:active.
- `<sc-if value={{x}}>` → `{x && …}`; `<sc-for list={{xs}} as="x">` → `xs.map(x => …)`.
- Compute values exactly as in `logic.js`; handlers live in `../_shared/methods.js`.
- Screenshot-diff your page against the images above until < 1% difference.
