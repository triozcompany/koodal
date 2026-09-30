# Hyperframes Composition Brief: Koodal

## Objective
Create a short launch-style brag video for Koodal (கூடல்).

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape, 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: the CivicPulse/Koodal repo (Next.js app)
- Primary files read: `README.md`, `package.json`, `app/layout.tsx`, `app/(marketing)/_components/Hero.tsx`, `app/(marketing)/marketing.css`, `public/guide/*` (real app screens), `public/seed/CREDITS.md`
- Product name: Koodal · கூடல்
- Tagline / strongest claim: "Never marks its own homework." (README report card, Trust row). A case closes only when members confirm.
- Key UI moments recreated in HTML: the AI "Got it." result screen, the duplicate-merge to official case, the road-cave-in case screen with the 5-step timeline and "Check the fix".
- Copy taken from the project:
  - "Takes a minute. Excuses not accepted." / "Hates repeating itself." / "Never marks its own homework." (README report-card remarks)
  - "Three days-a garbage edukkala, smell romba jaasthi"
  - "The same problem filed ten times becomes one case with ten voices."
  - "CP-CHN-24823", "Fixed · 25 of 25 confirmed", "Closed by residents"
  - "ungakoodal.vercel.app", "14-day free trial · 12 Indian languages"
- Invented (framing only, no product claim): "Reported 14 times. Fixed… never."; the three illustrative duplicate-report chips in scene 3.

## Creative Direction
- Tone preset: default
- Creative direction: deadpan school report card for a neighbourhood, warm and human, never corporate
- Interpretation: comfortable pacing, one idea per scene, wit from dry one-line grades taken from the README, no shouting
- Angle: one issue goes through the loop (report, verify, resolve) and each stage earns a one-line grade. The payoff is that the community, not the app, marks the work done.
- Hook: "Reported 14 times." with 14 pins, then "Fixed… never."
- Outro / punchline: Koodal · கூடல் / "Report. Verify. Resolve. In the open."
- Avoid: generic SaaS language, abstract filler visuals, redesigning the brand

## Visual Identity
- Background: `#fbf9f5` with the hero's orange glow
- Text: `#111` / `#4d4d4d`
- Accent: `#e8590c`; teal `#0f8b83` for official cases; green for fixed
- Display font: Outfit (local copy of the app's font), DM Serif Display for card titles, Noto Sans Tamil for கூடல்
- Visual references: landing hero glow, phone-frame app screens, teal official-case card

## Storyboard
See `brag-plan.md`. Scene summary (final timing):
1. Hook: 0-3.0s: "Reported 14 times." + 14 pins, "Fixed… never." (beat-locked 1.60s)
2. Say it, AI files it: 3.0-8.0s: Tanglish voice note; AI result card rows arrive one by one; tap "Post as new issue"
3. Ten voices, one case: 8.0-12.5s: three duplicates merge (9.50s cue); counter 1→10, bar to 80%; OFFICIAL CASE stamp (11.60s)
4. Nobody marks their own homework: 12.5-17.9s: timeline fills step by step from 12.65s; tap "Check the fix"; 25 of 25 confirm badge
5. Outro: 17.9-21.0s: logo on the 17.91s cue, tagline, URL

## Audio
- Audio role: warm bed with sparse motion-matched accents
- Audio arc: fade in, soft UI accents through the flow, a stamp and a chime at the payoffs, logo hit, fade out
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3`
- Music treatment: volume 0.4, 1s fade-in, fade-out from 19.4s to 21s
- Music cue guidance: bundled preset (~114.8 BPM, beat every ~0.52s). Locks: 1.60, 3.70, 9.50, 12.65, 17.91. Beat-grid rows at 4.23, 4.75, 5.28, 5.80 and 11.60.
- Audio-reactive treatment: subtle; bass band nudges the backdrop glow opacity and scale. No text is touched, no waveform visuals.
- SFX: soft impacts on the hook and the official-case stamp, rollover ticks for rows, clicks for the two taps, a bong for the confirm, a heavy soft hit for the logo
- Audio files: copied into `composition/assets/`

## Hyperframes Instructions
Built with hyperframes-core, -animation, -creative, -keyframes and -cli. Gate: `npx hyperframes check` (0 errors).
