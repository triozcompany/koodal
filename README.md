# Koodal (CivicPulse)

A civic issue reporting app for Tamil Nadu — citizens report problems (potholes, garbage, streetlights, sewage, etc.), nearby residents support and add evidence, and once a report crosses a community-verification threshold it becomes an official case tracked through resolution.

Built with Next.js (App Router), Firebase (Firestore + client/admin SDKs), and Gemini for AI report analysis.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values, see below
```

You'll also need a Firebase Admin service account for local development — see [Environment & secrets](#environment--secrets).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To (re)seed sample Firestore data:

```bash
npx tsx scripts/seed-koodal.ts
```

## Environment & secrets

Nothing secret is committed to this repo. Copy `.env.example` to `.env.local` and fill in:

| Variable | Used for | Get it from |
|---|---|---|
| `GEMINI_API_KEY` | AI report analysis (`lib/domain/analyze.ts`) | https://aistudio.google.com/apikey |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server-side Firestore writes (deploy-time alternative to a local key file) | Firebase Console → Project Settings → Service Accounts |

For **local development**, `lib/firebase/admin.ts` prefers a JSON key file over the env var:

```
secret/<project-id>-firebase-adminsdk-*.json
```

Download this from Firebase Console → Project Settings → Service Accounts → *Generate new private key*, and drop it in `secret/`. That whole folder is gitignored except `secret/service-account.example.json`, which documents the expected shape — copy the real file in beside it, don't overwrite it.

For **deployment** (Vercel or similar), you generally can't ship that file — set `FIREBASE_SERVICE_ACCOUNT_JSON` as a platform environment variable instead, pasting the entire service-account JSON as a single-line string. If neither the file nor the env var is present, `admin.ts` falls back to `gcloud auth application-default login` (ADC), which only works for local development.

The Firebase **client** (web) config in `lib/firebase/client.ts` is not secret — Firebase web API keys are safe to expose publicly; access is enforced by Firestore security rules, not by hiding that key. It's already committed as literal values; only change it if you're pointing this app at a different Firebase project.

## Project structure

- `app/(citizen)/` — the citizen-facing app (Next.js App Router), one route folder per screen (`feeds/`, `search/`, `cases/`, `issues/[issueId]/`, `profile/`, `settings/`, etc.), each typically split into a mobile `*Screen.tsx` and a desktop `Desktop*.tsx`.
- `lib/domain/` — pure domain logic and types shared across screens (stages, filters, scoring, dedup, etc.), no framework or I/O dependencies.
- `lib/firebase/` — Firestore client SDK (`client.ts`) and Admin SDK (`admin.ts`) setup.
- `server/actions/` — Next.js Server Actions that perform the actual Firestore writes.
- `design_handoff_koodal/` — the design source of truth (interactive prototype + per-screen markup/logic slices) that the citizen UI is ported from.
- `scripts/seed-koodal.ts` — seeds sample issues/cases into Firestore for local development and demos.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run a production build |
| `npm run test` | Run the test suite (Vitest) |
