# Koodal test guide

How to sign in as staff (Console) and as a citizen, and a set of test scenarios with the result you should see.

> **These are demo accounts for a hackathon build.** The passwords and codes below are public in this file. Do not reuse them anywhere real, and change them (or run the seed with a different password) before showing this to anyone outside the team.

---

## 1. Start the app

```bash
npm install
cp .env.example .env.local     # fill in the values (see README, "Environment & secrets")
npm run dev                    # http://localhost:3000
```

You need, in `.env.local`: the Cloudinary keys (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, and `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` for deleting photos), and the Firebase service account at `secret/trioz-319df-firebase-adminsdk-*.json` (or `FIREBASE_SERVICE_ACCOUNT_JSON`).

| App | URL | Who uses it |
|---|---|---|
| Citizen app | http://localhost:3000/nearby (sends you to sign-in first) | Residents who report and support issues |
| Console | http://localhost:3000/console/sign-in | Municipal staff who decide, assign and fix |

The two apps share one Firestore project, so what a citizen reports appears in the Console and what staff do appears back in the citizen app.

---

## 2. Console credentials (staff)

Sign-in is **employee ID + password, then a 6-digit code**.

| Employee ID | Name | Role | Sees | Password |
|---|---|---|---|---|
| `GCC-1001` | Divya Raghavan | **Admin** | All departments | `koodal-demo` |
| `GCC-2041` | Priya Natarajan (Junior Engineer) | Staff | **Roads** only | `koodal-demo` |
| `GCC-2042` | Farida Begum (Assistant Engineer) | Staff | **Water & Drainage** and **Sanitation** | `koodal-demo` |

- **Code screen:** enter **any six digits** (for example `123456`). Text-message codes are not switched on, and the server does not check the code. The password is the only real check.
- **Lockout:** five wrong passwords lock that employee ID for **5 minutes** (even the right password is refused meanwhile). Unknown IDs and wrong passwords show the same message on purpose.
- **Unlock immediately:** in Firebase Console, open `staff/<ID>` and set `lockUntil` to `null` and `failedAttempts` to `0`.
- **Deactivate / reactivate an account:** set `active` to `false` / `true` on `staff/<ID>`. A deactivated account cannot sign in, and an open session is signed out on its next load.
- **Change your password:** Console → Settings → Security → Change password (8+ characters).

The three staff accounts are created by `scripts/seed-console.ts` (see section 8).

---

## 3. Citizen credentials

Citizen sign-in is **phone number → code → Aadhaar check → profile**. All of it is a demo: no real SMS or Aadhaar call is made.

| Step | What to enter |
|---|---|
| Intro screen | Tap **Log in** (or **Next** to see the intro first) |
| Phone | `8787878787` (tap **Use demo number**), then **Send OTP** |
| Code | Fills itself with `482137` (any 6 digits are accepted), then **Verify** |
| Aadhaar (first time only) | `8787 8787 8787` (tap **Use demo Aadhaar**), tick the consent box, **Verify identity** |
| Profile (first time only) | Any name, and pick an area, for example *Velachery, Chennai* |

Returning users who are already verified go straight in after the code.

**You need several citizens to test the full lifecycle**, because a report only becomes a case once **5 people support it** (the reporter counts as 1, so four more). Any 10-digit number works and each number is its own citizen. Suggested test numbers:

| Citizen | Phone |
|---|---|
| Reporter | `8787878787` |
| Supporter 1 | `9000000001` |
| Supporter 2 | `9000000002` |
| Supporter 3 | `9000000003` |
| Supporter 4 | `9000000004` |

Use a **separate browser profile or an incognito window per citizen** (the sign-in is stored in the browser). Every citizen goes through the Aadhaar and profile steps once.

---

## 4. What the data looks like

- **Real vs demo:** the database also holds ~30 sample issues that came with the design (fake names, striped placeholder photos). The Console **hides them by default** and tags them **Demo** when shown. Only reports created by a signed-in citizen count as real. Turn demo data on or off in **Console → Settings → Data → Show demo data**.
- **Jurisdiction:** the Console shows reports in Chennai, or with GPS inside the Chennai metro area (this includes places like Guduvancheri and Tambaram). Reports elsewhere do not appear.
- **Cases vs signals:** a report is a *signal* until it has an official case ID. It gets one when support reaches 5 supporters (or 80% confidence); then it waits in the Console as **Pending approval**.

---

## 5. Test scenarios

Each scenario lists the steps and the expected result. Do them in order the first time; later ones build on earlier data.

### A. Console sign-in and roles
1. Open `/console/sign-in` as `GCC-1001` / `koodal-demo`, code `123456`.
   **Expect:** the Home screen greets "Vanakkam, Divya"; no "Showing cases for…" chip (admin sees everything).
2. Sign out (Settings → Sign out) and sign in as `GCC-2041`.
   **Expect:** Home shows **Showing cases for Roads**; Cases, Map and Insights only contain Roads cases.
3. Repeat as `GCC-2042`.
   **Expect:** chip reads **Showing cases for Water & Drainage and Sanitation**.
4. Try a wrong password once, then an unknown ID such as `NOBODY-1`.
   **Expect:** the same message both times: "Employee ID or password is incorrect."
5. Enter a wrong password five times for `GCC-2042`.
   **Expect:** "Too many attempts. Try again in 5 min." Unlock it (section 2) before continuing.

### B. Real data only, demo data on and off
1. As `GCC-1001`, open Cases with demo data off (default).
   **Expect:** only real reports. If none have become cases yet you see **No real cases yet**, and your real reports appear under **New signals**.
2. Settings → Data → switch **Show demo data** on, then open Cases.
   **Expect:** the sample cases appear with a small **Demo** tag; the counts on the Cases and New signals tabs jump up. Switching it off hides them again. Reload the page and sign in from another browser: the choice is remembered on your account.

### C. A real report, end to end (citizen → Console → citizen)
1. **Citizen (8787878787):** report an issue: a photo, a category, a location, then submit.
   **Expect:** it appears in the Console under **Cases → New signals** with your photo, "1 of 5 supporters", and no reporter name.
2. **Citizens 9000000001–9000000004:** each signs in, finds the report and taps **Support**.
   **Expect:** after the 5th supporter the report gets an official case ID and moves out of New signals; in the Console it is under **Pending approval** (Home "Needs your decision", the Cases badge, and the map).
3. **Console (`GCC-1001`):** open the case → **Approve & assign** → pick department, team and target date → confirm.
   **Expect:** status becomes **Assigned**; the timeline shows "Verified…", "Official case…", "Assigned to…" each **by Divya Raghavan**. The citizen app shows the case as official.
4. Case page → **Start work on site**.
   **Expect:** status **In progress**.
5. Case page → **Mark as fixed** → add one or more photos → **Send for confirmation**.
   **Expect:** photos upload with a spinner, then thumbnails; the button stays disabled until every photo is uploaded. Status becomes **Fixed · confirming** and the proof thumbnails show on the case and its timeline.
6. **Citizens:** open the case and answer whether it is fixed.
   - Three **not fixed** answers → the case **reopens** (back to In progress, flagged Reopened; the Console Home alert counts it).
   - **Confirmed** answers count up; the case **closes** when confirmations reach the required number (25 by default; for a quick test lower `needed` on that issue in Firestore, for example to 2).

### D. New signals and "Take up as case"
1. Create a report as a citizen and do **not** support it further.
2. Console → Cases → **New signals** → **Take up as case** on that report.
   **Expect:** a drawer asks for department, team and target date. After confirming, the report is an official **Assigned** case straight away, and the timeline reads "Taken up early by Greater Chennai Corp." The button is only offered on signals.

### E. Reject with proof
1. Open a **Pending approval** case → **Reject with reason**.
2. Choose a reason, write an explanation (15+ characters), and upload at least one photo.
   **Expect:** **Reject case** stays disabled until all three are done. Afterwards the case is **Rejected** and shows the reason, explanation and your photos. Choosing "Duplicate of an existing case" also asks for the existing case ID.
3. Open the reject drawer, upload a photo, then **Cancel**.
   **Expect:** nothing is saved and the uploaded photo is deleted from Cloudinary.

### F. Cases list and board
1. Cases → toggle **List / Board** (the choice is remembered).
2. On **Board**, drag a Pending card to **Assigned** (opens the approve drawer), to **Rejected** (opens the reject drawer), drag an Assigned card to **In progress** (starts work at once), and an In-progress card to **Fixed** (opens the fix drawer).
   **Expect:** dropping anywhere else shows why it isn't allowed, for example "Only citizens can close a case…".
3. Use search and the **Filters** drawer (status, area, department, problem type, sort). Filters live in the URL, so the browser Back button works.

### G. Map
1. Open **Map**. The map opens in **3D** (toggle it with the cube button). Nearby cases group into black count **clusters**; click one to zoom in.
2. Type in the search box above the list (on a phone: **Show list**). **Expect:** the list, pins, clusters and counts all narrow together.
3. Select a pin, then **Open case**, then press **Back**.
   **Expect:** the same view: camera position, selected pin and card, filters, search text and list scroll.
4. From a case page use **View on map**; that case is selected.

### H. Insights, Search and shortcuts
1. **Insights:** change **When** (quick ranges or a custom range in the drawer), filter by area, department or problem type, click a KPI to switch the chart, click a bar to zoom in, then **Export CSV**.
   **Expect:** the CSV downloads; numbers match Home for the same period.
2. **Search:** press **`/`** anywhere in the Console (not while typing in a field). **Expect:** the Search screen opens with the cursor in the box; recent searches appear next time.

### I. Settings and account
1. **Settings → Notifications / Auto sign-out / Language:** change a few, then sign in from another browser.
   **Expect:** they are still set (saved on your account). Notifications are stored only; no alerts are delivered yet.
2. **Change password:** wrong current password is refused; new password under 8 characters is refused; a valid change works and the old password stops working. Change it back to `koodal-demo` afterwards.
3. **Download action log:** only lists actions **you** took (each event is stamped with your employee ID). A staff member who has done nothing gets "No recorded actions yet".
4. **Profile:** "Decisions made" counts only your approvals and rejections.
5. **Auto sign-out:** set 15 minutes, stay idle, and you are signed out.

### J. Config in Firestore (admins)
Edit `orgs/gcc` in Firebase Console, then sign in again (the server caches it for up to a minute):
- `decisionSlaHours` changes the decision deadline and the "Target …h" label on Profile.
- `rejectReasons`, `quickTargetDays`, `targetDaysBySeverity` change the reject list and the approve drawer defaults.
- `departments[].teams` changes the team choices; `departments[].citizenDepts` decides which citizen-side department names belong to each staff department (this also controls what each staff member can see).

---

## 6. Cleaning up after testing

- **Test issues:** delete them in Firebase Console (`issues/<id>`). Photos staff attached stay in Cloudinary unless removed in the drawer before saving; delete leftovers in the Cloudinary console (folder-less, sorted by newest).
- **Test citizens:** documents under `users/ph_<phone>` can be deleted the same way.
- **Case numbers:** each approval or take-up uses the next number in `counters/case` (`caseSeq`); it is fine to leave it.
- **Settings for a staff member:** delete the `prefs` field on `staff/<ID>` to return them to defaults.

---

## 7. Known limitations

- The Console **code screen is a demo** (any six digits). Only the password is checked.
- **Notifications are not delivered**; the toggles are saved for later.
- The Console language picker saves your choice but the Console text stays English.
- There is **no screen to edit the org config**; edit `orgs/gcc` in Firestore.
- Citizens still see striped placeholders instead of the staff **proof photos** on the fix-verification screen.
- Reports whose location the geocoder cannot name may show the area "Velachery".
- There is no `firestore.rules` file in the repo; access control depends on the rules set in the Firebase Console.

---

## 8. Resetting or re-creating accounts and data

```bash
# Staff accounts + org config (safe to re-run; keeps existing passwords and config)
npx tsx scripts/seed-console.ts

# Set all three staff passwords back to the default (or to STAFF_SEED_PASSWORD)
npx tsx scripts/seed-console.ts --reset-passwords
STAFF_SEED_PASSWORD='choose-something-else' npx tsx scripts/seed-console.ts --reset-passwords

# Replace the org config with the built-in defaults
npx tsx scripts/seed-console.ts --overwrite-config

# Sample design data (30 demo issues) — WARNING: deletes EVERY issue first, including real citizen reports
npx tsx scripts/seed-koodal.ts
```

If `npx tsx` cannot resolve the `@/` imports, add `--tsconfig tsconfig.json`.
