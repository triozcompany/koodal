# Koodal demo guide

A click-by-click walkthrough of every demo flow in the citizen app and the Koodal Console, built on the seeded test data. Every screenshot comes from a real run of these steps. The **red box with a number** marks what to click, in that order.

> Demo accounts only. The passwords and codes here are public. Do not reuse them anywhere real.

**Contents**
0. [Before you record](#0-before-you-record)
1. [Login: citizen and Console](#1-login)
2. [Citizen onboarding (new user)](#2-citizen-onboarding)
3. [New issue: five neighbours make it a case](#3-new-issue--five-neighbours-make-it-a-case)
4. [Join an existing issue (duplicate found)](#4-join-an-existing-issue)
5. [Support an issue: three threshold cases](#5-support-an-issue-three-threshold-cases)
6. [An issue you already support](#6-an-issue-you-already-support)
7. [Completed case, and closing one yourself](#7-completed-case)
8. [Ongoing case: the Console updates, the citizen app follows live](#8-ongoing-case-live-status-updates)
9. [Analytics in the Console](#9-analytics)
10. [Admin: test mode, thresholds, seed / reset / remove](#10-admin-test-mode-and-thresholds)
11. [Recording order for one continuous video](#11-recording-order)

Org creation, org join and Console onboarding (`/console/get-started`) are not covered, because they are not implemented yet.

---

## 0. Before you record

**Start the app:** `npm run dev`, then open http://localhost:3000.

**Use two browser windows.** Both apps run on the same site and share one sign-in store. A citizen login and a Console login in the same window would sign each other out. Use:
- **Window A, citizen:** a normal window, narrowed to phone width (or DevTools device mode, iPhone 14, 390 × 844).
- **Window B, Console:** an incognito or second-profile window at desktop width.

For the five-supporter flow you sign in as each supporter in turn. Use one more incognito window, or log out and back in inside Window A (Profile → Log out).

**Reset the data before every take.** Console → Settings → Test mode → **Reset seed data** (section 10), or from a terminal: `npx tsx scripts/seed-koodal.ts`.

### Test accounts

These are listed on both sign-in pages while **test mode** is on. Tap an account to fill it in.

| Citizen app | Phone | Used for |
|---|---|---|
| Kavya Raman | 90000 00001 | Main demo citizen, "you" in the video |
| Arjun Kumar | 90000 00002 | Supporter 2 |
| Meena Sundaram | 90000 00003 | Supporter 3 |
| Karthik Selvam | 90000 00004 | Supporter 4 |
| Lakshmi Narayanan | 90000 00005 | Supporter 5 |
| Sathish Kumar | 87878 78787 | Madurai citizen |
| New citizen | 90000 00009 | Not registered, so it walks through full onboarding |

The OTP fills itself in (`482137`), and the Aadhaar step has a **Use demo Aadhaar** button.

| Console | Employee ID | Password | Used for |
|---|---|---|---|
| Divya Raghavan, Admin | GCC-1001 | koodal-demo | Test mode, thresholds, seed / reset, all departments |
| Priya Natarajan, Roads | GCC-2041 | koodal-demo | Works CP-S5 in the live-update flow |
| Farida Begum, Water & Sanitation | GCC-2042 | koodal-demo | A second department scope |

The code screen has a **Use test code 123456** button.

### Seeded scenarios (Chennai)

Thresholds are the defaults: a case opens at **5 supporters or 80% confidence**. Each support adds 8%. The reporter counts as the first supporter.

| ID | Title | Starts at | Demonstrates |
|---|---|---|---|
| CP-S1 | Deep pothole near Vijayanagar bus stand (Velachery) | 2 supporters | **Join** target for a new pothole report at the default Velachery spot |
| CP-S2A | Rainwater stagnating at Madipakkam junction | Case CP-CHN-24821, pending | **Already over** the threshold, waiting for the Console to decide |
| CP-S2B | Garbage piling up near Adyar bus depot | 4 supporters · 48% | **Crosses only if you support** (supporter rule: 4 → 5) |
| CP-S2C | Sewage overflowing on Kutchery Road (Mylapore) | 3 supporters · 74% | **Crosses only if you support** (confidence rule: 74% → 82%) |
| CP-S2D | Streetlights dark on Pondy Bazaar 2nd lane | 2 supporters · 32% | **Still short after you support** (3 · 40%) |
| CP-S3 | Storm drain left open without barricade (Perungudi) | Assigned | **Already supported** by Kavya |
| CP-S4 | Potholes on Kathipara service road | Closed | **Completed**: fixed with proof photo, confirmed by citizens |
| CP-S4B | Broken footpath tiles on Elliot's Beach Road | Fixed, 2 of 3 confirmations | **Kavya's confirmation closes it** |
| CP-S5 | Road cave-in near Phoenix Mall signal (Velachery) | Assigned to Roads | **Ongoing**: the Console starts work and marks it fixed, live |
| CP-S6 | Waste dumped inside a fenced plot (Saidapet) | Rejected with proof | A rejected case |

**Also seeded:**
- About 30 Chennai cases spread over the last 90 days, which feed the Insights charts.
- Madurai issues (Goripalayam, Anna Nagar, Simmakkal, KK Nagar, Tallakulam, Periyar Bus Stand) and Coimbatore issues (RS Puram, Gandhipuram, Peelamedu, Saibaba Colony, Ukkadam). These appear in the citizen app. The Console covers Greater Chennai only.

Open any issue directly at `/issues/<ID>`, for example http://localhost:3000/issues/CP-S2B.

---

## 1. Login

### Console (Window B)
1. Go to `/console/sign-in` and tap the **GCC-1001** card. The ID and password fill in.
   ![Console sign-in: pick a test account](guide/10-console-signin-pick.jpg)
2. Tap **Continue**.
   ![Continue](guide/10-console-signin-continue.jpg)
3. Tap **Use test code 123456**, then **Verify & continue**.
   ![Code screen](guide/10-console-code.jpg)
4. You land on Home.
   ![Console home](guide/10-console-home.jpg)

### Citizen (Window A)
1. Go to http://localhost:3000, tap **Log in**, then tap **Kavya Raman · 90000 00001**.
   ![Citizen phone step](guide/10-citizen-phone.jpg)
2. Tap **Send OTP**.
   ![Send OTP](guide/10-citizen-send.jpg)
3. The code fills itself in. Tap **Verify**.
   ![OTP](guide/10-citizen-otp.jpg)
4. You land on **Nearby**. Kavya is already verified, so there is no onboarding.
   ![Nearby](guide/10-citizen-nearby.jpg)

---

## 2. Citizen onboarding

Use a fresh window (not signed in) with **90000 00009**.

1. The intro has three slides. Tap **Next**…
   ![Intro](guide/09-onb-intro.jpg)
2. …then **Get started**.
   ![Intro, last slide](guide/09-onb-intro3.jpg)
3. Tap **New citizen · 90000 00009**, then **Send OTP**, then **Verify**.
   ![Phone](guide/09-onb-phone.jpg)
4. Tap **Use demo Aadhaar**…
   ![Aadhaar](guide/09-onb-aadhaar.jpg)
5. …then **Verify identity**, then **Continue**.
   ![Verify identity](guide/09-onb-aadhaar-verify.jpg)
6. Type a name, pick an area (for example *Velachery, Chennai*), then tap **Continue**.
   ![Profile](guide/09-onb-profile.jpg)
7. Tap **Allow location**.
   ![Permissions](guide/09-onb-permissions.jpg)
8. You are in the app.
   ![Done](guide/09-onb-done.jpg)

---

## 3. New issue: five neighbours make it a case

**Window A, Kavya.** This is the full "report, then support" loop, using all five test citizens.

1. On Nearby, tap the **camera** button.
   ![Camera button](guide/01-new-camera-button.jpg)
2. Take a photo, or tap the **gallery** icon and pick a garbage photo. A good one is `public/seed/garb1.webp`.
   ![Camera](guide/01-new-camera.jpg)
3. Enter a title such as *Garbage dumped near Vijayanagar bus stand*, pick the **Garbage** category, and add a short description. The location fills in from GPS.
   ![Report form](guide/01-new-form.jpg)
4. Scroll down and **drag the orange arrow** to the right to report.
   ![Slide to report](guide/01-new-slide.jpg)
5. The AI analysis screen runs.
   ![AI scanning](guide/01-new-ai-scanning.jpg)
6. It shows **No similar issue nearby**. Tap **Post as new issue**.
   ![AI result](guide/01-new-ai-result.jpg)
7. The report is live: 1 supporter at 24%. Note its ID (for example CP-2201).
   ![Posted](guide/01-new-posted.jpg)
8. Sign in as **Arjun (90000 00002)** and open the report: search for it, or go to `/issues/<ID>`. **Press and hold "Hold to support"** until the button fills.
   ![Supporter 2](guide/01-support-user2.jpg)
9. Repeat as **Meena (…03)** and **Karthik (…04)**. After Karthik the report has 4 supporters. When **Lakshmi (…05)** supports it, it reaches **5 supporters and becomes an official case**, and the celebration modal opens.
   ![5th supporter: case created](guide/01-support-user5-case.jpg)
10. Tap **Track verification** to open the case.
    ![Case view](guide/01-support-user5-track.jpg)

In Window B, Console Home now lists this report under **Needs your decision**.

> Everything the AI screens show (classification, voice transcript, severity) is a demo mock. What happens underneath is real: the duplicate check, the report, the supports and the case creation.

---

## 4. Join an existing issue

**Window A, Kavya.** At the default Velachery location, the seeded CP-S1 pothole is about 60 m away.

1. Tap the camera, pick a pothole photo (for example `public/seed/road2.webp`), choose **Roads**, add a title, and slide to report.
   ![Pothole report](guide/02-join-form.jpg)
2. The AI screen finds **1 match nearby**. Tap **1 match nearby · See it**.
   ![Match found](guide/02-join-ai.jpg)
3. The match screen shows CP-S1. Tap **Join 2 neighbours**. The other button, **Mine is different**, would post a separate report.
   ![Join](guide/02-join-match.jpg)
4. You are now a supporter of CP-S1 (2 → 3), and your photo is added to it. **Joining counts as a support**, so when joining takes an issue over the threshold, it becomes a case exactly as if you had tapped Support.
   ![Joined](guide/02-join-joined.jpg)

---

## 5. Support an issue: three threshold cases

**Window A, Kavya.**

### 5a. Already over the threshold: CP-S2A
It is already an **official case** (CP-CHN-24821) with 7 supporters, waiting for the Console to decide. Support is closed; the bottom button is **Track official case**. In the Console (GCC-1001) it is under Home → **Needs your decision**, with Approve and Reject.
![CP-S2A](guide/03-s2a-official.jpg)

### 5b. Crosses only if you support (supporter rule): CP-S2B
1. It has 4 supporters at 48%. **Hold to support**.
   ![CP-S2B before](guide/03-s2b-before.jpg)
2. It reaches 5 supporters, so it becomes an official case.
   ![CP-S2B case](guide/03-s2b-case.jpg)

### 5b (variant). Crosses on the confidence rule: CP-S2C
1. It has 3 supporters at 74%. **Hold to support**.
   ![CP-S2C before](guide/03-s2c-before.jpg)
2. Confidence reaches 82%, which is over 80%, so it becomes a case with only 4 supporters.
   ![CP-S2C case](guide/03-s2c-case.jpg)

### 5c. Still short after you support: CP-S2D
1. It has 2 supporters at 32%. **Hold to support**.
   ![CP-S2D before](guide/03-s2d-before.jpg)
2. It moves to 3 supporters and 40%. It is **not** a case yet: review starts at 5 supporters or 80% confidence.
   ![CP-S2D after](guide/03-s2d-after.jpg)

**Window B, Console Home:** the new cases appear under **Needs your decision**.
![Console: needs your decision](guide/03-console-needs-decision.jpg)

---

## 6. An issue you already support

**Window A.** Open **CP-S3**. Kavya supported it earlier, and it has since become an official case assigned to the Water & Drainage Team. Official cases no longer take support; the bottom button is **Track official case**.
![CP-S3](guide/04-s3-supported.jpg)

The **Cases** tab (bottom right), under **Following**, lists the cases you reported or supported, CP-S3 among them.
![Cases tab](guide/04-cases-tab.jpg)

---

## 7. Completed case

1. **CP-S4** is closed. It shows the department's fix note and proof photo, and citizens confirmed the fix.
   ![CP-S4 closed](guide/05-s4-closed.jpg)
2. **CP-S4B** has been marked fixed and has 2 of 3 confirmations. Tap **Check the fix**.
   ![CP-S4B](guide/05-s4b-check.jpg)
3. Compare the before and after photos, then tap **Fixed**.
   ![Is it fixed?](guide/05-s4b-verify.jpg)
4. That is the 3rd confirmation, so the case **closes**.
   ![CP-S4B closed](guide/05-s4b-closed.jpg)

*(Three "Not yet" answers would reopen the case instead.)*

---

## 8. Ongoing case: live status updates

Put both windows side by side. **Window A:** Kavya on **CP-S5**. **Window B:** the Console signed in as **GCC-2041** (Roads).

1. **Citizen:** CP-S5 is **Assigned** to the Roads Team.
   ![Citizen: assigned](guide/06-s5-citizen-assigned.jpg)
2. **Console:** open Cases → *Road cave-in near Phoenix Mall signal* (or `/console/cases/CP-S5`), then tap **Start work on site**.
   ![Console: start work](guide/06-s5-console-start.jpg)
3. **Citizen, without refreshing:** the stage changes to **In progress**.
   ![Citizen: in progress](guide/06-s5-citizen-progress.jpg)
4. **Console:** tap **Mark as fixed**, add an after photo (for example `public/seed/fix2.webp`), write a short note, then tap **Send for confirmation**.
   ![Console: mark fixed](guide/06-s5-console-markfixed.jpg)
5. **Citizen, without refreshing:** the case shows **Marked fixed** and offers **Check the fix**. Finish it the same way as CP-S4B in section 7. In test mode, 3 confirmations close a case.
   ![Citizen: fixed](guide/06-s5-citizen-fixed.jpg)

---

## 9. Analytics

**Window B, GCC-1001.** Open **Insights**. It shows 90 days of seeded Chennai history plus anything you did in this session: opened vs fixed, resolution time, on-time %, department performance, the hotspot matrix, recurring cases and reopened cases. Change **When**, **Area**, **Department** or **Problem type** to filter.
![Insights](guide/08-insights.jpg)

[Full-page Insights screenshot](guide/08-insights-full.jpg)

The **Cases** list shows every Chennai case with its status and target date.
![Cases list](guide/08-cases-list.jpg)

---

## 10. Admin: test mode and thresholds

**Window B, GCC-1001 → Settings.** Only an **admin** sees the **Test mode & thresholds** card. Staff accounts such as GCC-2041 do not ([screenshot](guide/11-staff-settings-no-testmode.jpg)).

1. **Test mode** switch. While it is on:
   - both sign-in pages list the test accounts;
   - **Seed data**, **Reset seed data** and **Remove all data** are enabled.

   Turn it off before a real demo audience signs in.
   ![Test mode](guide/00-settings-testmode.jpg)
2. **Thresholds:**
   - supporters to open a case (5);
   - or confidence (80%);
   - confidence added per support (8%);
   - confirmations needed to close a fixed case.

   Set the last one to **3** for the demo, so the five test citizens can close a case. Then tap **Save thresholds**. The changes apply immediately (the citizen app picks them up on its next page load).
   ![Thresholds](guide/00-settings-thresholds.jpg)
3. **Reset seed data** deletes:
   - the seeded records;
   - the older sample cases;
   - everything the test citizens reported;
   - the test citizens themselves.

   It then seeds a fresh copy. Reports from real citizens are kept. Confirm in the drawer.
   ![Reset confirm](guide/00-reset-confirm.jpg)
   ![Reset done](guide/00-reset-done.jpg)
4. **Seed data** adds the seed set without deleting anything else.
5. **Remove all data** deletes every report and case (real ones too), every citizen profile and the ID counters. Staff accounts and settings are kept. You must type `DELETE` to confirm.

The same reset from a terminal: `npx tsx scripts/seed-koodal.ts`. To remove everything: `npx tsx scripts/seed-koodal.ts --wipe`.

---

## 11. Recording order

A single take of about 8–10 minutes, with no data conflicts between flows:

| # | Window | Account | Do | Section |
|---|---|---|---|---|
| 0 | B | GCC-1001 | Settings: test mode on, confirmations = 3, **Reset seed data** | 10 |
| 1 | A | — | Citizen login as Kavya | 1 |
| 2 | B | — | Console login (show the test accounts list) | 1 |
| 3 | C (incognito) | 90000 00009 | Onboarding | 2 |
| 4 | A | Kavya | New garbage report → posted | 3 |
| 5 | C | Arjun → Meena → Karthik → Lakshmi | Support it; 5th support → case modal | 3 |
| 6 | A | Kavya | Pothole report → match → Join CP-S1 | 4 |
| 7 | A | Kavya | CP-S2A, then CP-S2B (case), CP-S2C (case on %), CP-S2D (stays short) | 5 |
| 8 | B | GCC-1001 | Home: Needs your decision shows the new cases | 5 |
| 9 | A | Kavya | CP-S3 (supported), Cases tab, CP-S4 (closed), CP-S4B → confirm → closed | 6–7 |
| 10 | B → A | GCC-2041 / Kavya | CP-S5: Start work, then Mark as fixed; watch Window A update live | 8 |
| 11 | B | GCC-1001 | Insights, Cases list | 9 |

**Between takes:** repeat step 0 (Reset seed data). This also removes the reports you created and the onboarding user, so 90000 00009 is new again.

### Troubleshooting
- **No test accounts on a sign-in page:** test mode is off. Turn it on in Console → Settings.
- **"Mine is different" was the main button instead of Join:** your report's location is not near Velachery. Tap the location row and pick Velachery Main Rd / Vijayanagar bus stand.
- **No Hold to support button:** you reported this issue (you see **Edit report** instead), or it is already an official case (**Track official case**).
- **Console shows only one department:** you are signed in as GCC-2041 or GCC-2042. Use GCC-1001 for the full view.
- **Photo credits** for the seeded images: `public/seed/CREDITS.md` (Wikimedia Commons, CC licences).
