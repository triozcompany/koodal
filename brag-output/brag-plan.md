# Brag Plan: Koodal (கூடல்)

## What is this app?
Koodal is one open loop where any community (city, apartment, campus) reports, verifies and resolves its issues in public. A case closes only when the people who reported it say it's fixed.

## The angle
**The report card.** Koodal's own README grades itself like a school report card with dry remarks ("Never marks its own homework." / "Plays well with others."). The video runs the same joke: a neighbourhood issue goes through the loop, and each stage gets a deadpan grade. The punchline is the trust claim: the fix is only real once the residents say so, so the app never marks its own homework.

## Hook (first 2-3 seconds)
Giant type on warm cream: **"Reported 14 times."** then **"Fixed... never."** (a pothole everyone has complained about). A cursor is about to file report #15. It sets up the pain that Koodal closes.

## Key moments (the middle)
- **Voice note in, report out:** Tanglish voice note *"Three days-a garbage edukkala, smell romba jaasthi"* turns into a structured card: Garbage dump · 93%, High risk, goes to Solid Waste Mgmt · Greater Chennai Corp.
- **Ten voices, one case:** duplicates collapse into a single case, neighbours support, the 80% bar is crossed and **OFFICIAL CASE CP-CHN-24823** stamps in.
- **Nobody marks their own homework:** the road cave-in at Phoenix Mall signal is marked fixed by the corporation, then residents vote. **Fixed · 25 of 25 confirmed.**

## Outro / punchline
"Never marks its own homework." then the Koodal mark, **Koodal · கூடல்**, tagline "Report. Verify. Resolve. In the open." and `ungakoodal.vercel.app`.

## User flow worth showing
1. **Entry → key action:** member records a Tamil/Tanglish voice note, AI scan fills category, severity and department (real `New issue` AI result screen).
2. **Community step:** neighbours support, duplicates merge, the case goes official (real case timeline: Reported → Community → Verified → Action → Fixed).
3. **Result:** Console marks fixed, residents confirm, case closes (real "Check the fix" and "Fixed · 25 of 25 confirmed" states).

## Tone
- Preset: `default`
- Creative direction: deadpan school report card for a neighbourhood, warm and human, never corporate
- Interpretation: comfortable pacing with one idea per scene. The wit comes from the dry one-line grades and the product's own copy, with restraint and no shouting.

## Format: landscape — 1920x1080
## Duration: 21 seconds

## Visual identity (from the project)
- Background: `#fbf9f5` (warm cream), with the hero's soft orange glow `radial-gradient(#f08a4b → #f6b489 → #fbe3d2 → #fbf9f5)`
- Accent: `#e8590c` (Koodal orange); supporting teal `#0f8b83` for official case cards, green `#12a150` for fixed
- Text: `#111` headings, `#4d4d4d` body
- Display font: Outfit (600-700, tight tracking -0.045em); DM Serif Display for card titles ("Got it.", "Road cave-in near Phoenix Mall signal"); Noto Sans Tamil for the கூடல் wordmark
- Body font: Outfit
- Strongest visual element: the phone-frame app screens (AI result card with orange detection box, the five-step case timeline, teal official-case card) on the cream/orange glow hero

## Share copy (draft)
We built an app where a city issue only closes when the people who reported it say it's fixed. Koodal never marks its own homework. 🧡 ungakoodal.vercel.app

## Audio direction
- Role: warm, upbeat bed with sparse, motion-matched UI accents
- Music: bundled `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (warm business-groove, civic and friendly, not corporate-cold)
- Music treatment: starts at 0s, about 35% volume under SFX, 1s fade-in, 1.5s fade-out ending at 21s
- Music cue guidance: read preset `vol-11` (~114.8 BPM, beat every ~0.52s). Strong cues to target: 3.70s (AI result card lands), 9.50s (OFFICIAL CASE stamp), 17.91s (Koodal logo). Sequential card reveals snap to every other beat (~1.05s apart) so text stays readable.
- Audio-reactive treatment: subtle; use music RMS/bass to make the hero glow and phone-frame presence breathe. No waveform or equalizer visuals.
- SFX posture: sparse, motion-matched, professional restraint
- Audio-coupled moments: voice-note waveform scan, AI card rows arriving one by one, duplicate merge, official-case stamp, the final confirm ticks
- Restraint rule: audio never covers reading moments. Keep accents quiet and no sound on pure text holds.

## Storyboard

### Scene 1: The hook: 3.0s
Cream background with the orange glow rising. Big type: "Reported 14 times." holds, then "Fixed… never." lands under it. A pothole photo from the real seed set sits behind, blurred and small. Each line holds at least 1.2s settled.
Sequential/interaction: yes, two lines arrive one after the other (line 1 at 0.2s, line 2 at ~1.4s), each held long enough to read.
Audio intent: dry and slightly ironic, with a soft low thud on the second line.
Audio-coupled idea: a quiet key tick as the second line appears.
Music: warm bed fades in.
Transition mood: clean wipe → Scene 2

### Scene 2: Say it: AI files it: 5.0s
Phone frame (real app "New issue" AI result screen, recreated in HTML) centre-right. A Tanglish voice note bubble on the left: *"Three days-a garbage edukkala, smell romba jaasthi"*. The orange detection box draws on the photo: "Garbage dump · 93%". Then four rows arrive one by one: Classified, Heard (Tanglish), Severity ("High risk · ~3 m² heap"), Goes to ("Solid Waste Mgmt · Greater Chennai Corp."). Caption: "Speak in your language. Koodal files it."
Sequential/interaction: yes, the rows arrive one by one, about 0.5s apart (short labels, so accents are fine), then all hold settled for ~1.3s. The cursor taps "Post as new issue" at the end.
Audio intent: light, helpful, "it understood me".
Audio-coupled idea: soft UI pops per row on beat, a tap click on Post.
Music: bed continues, strong cue at 3.70s.
Transition mood: slide → Scene 3

### Scene 3: Ten voices, one case: 4.5s
Duplicate cards about the Phoenix Mall road cave-in (the same problem filed by different neighbours, using the seed-data wording) slide in and stack into a single case. A supporters counter ticks up and the progress bar crosses the 80% threshold. The teal card stamps in: **OFFICIAL CASE · CP-CHN-24823** with "Greater Chennai Corp. · Roads Team". Grade line: "Duplicates: Hates repeating itself."
Sequential/interaction: yes, three duplicate chips arrive one by one, merge, then the counter ticks 1→10 and the bar fills. The stamp lands on the 9.50s cue.
Audio intent: satisfying accumulation into a stamp.
Audio-coupled idea: counter ticks, then a soft impact on the stamp.
Music: bed continues, strong cue at 9.50s.
Transition mood: clean wipe → Scene 4

### Scene 4: Nobody marks their own homework: 5.0s
Phone frame with the real case screen: "Road cave-in near Phoenix Mall signal", photo grid, the 5-step timeline (Reported, Community, Verified, Action, Fixed) filling step by step. Green banner "Marked fixed by Greater Chennai Corp." A cursor taps **Check the fix**. Then neighbours' votes flip to ✓ and a badge stamps in: **Fixed · 25 of 25 confirmed. Closed by residents.** Grade line: "Trust: Never marks its own homework."
Sequential/interaction: yes, the timeline steps fill one by one (~0.4s each), a cursor taps "Check the fix", and the votes tick. The final badge holds ≥1.5s.
Audio intent: the emotional payoff, warm resolution.
Audio-coupled idea: five soft ticks up the timeline, a tap, a bright confirm chime on the badge.
Music: bed swells slightly into the outro.
Transition mood: soft crossfade → Scene 5

### Scene 5: Outro: 3.5s
Clean cream with orange glow. The Koodal mark and **Koodal · கூடல்** at full scale on the 17.91s cue. Tagline: "Report. Verify. Resolve. In the open." Small line: ungakoodal.vercel.app · 14-day free trial · 12 Indian languages. Music fades out.
Sequential/interaction: none
Audio intent: a warm landing with a quiet end.
Audio-coupled idea: a single soft logo hit on the cue, then the music tail.
Music: fade out to silence at 21s.
Transition mood: end

**Music mood for this video:** upbeat, warm, human
**Audio summary:** a warm groove under a dry joke, light UI accents as the loop completes, then one confident logo hit and a clean fade.

## Privacy note
All on-screen names, cases and locations come from the app's fictional seed data (e.g. the "Kavya Raman" sample reporter, CP-CHN case IDs). No real user data, API keys or Firebase config are used. Screens are recreated in HTML and no live Firebase is touched.
