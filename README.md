<div align="center">

<img src="public/koodal-mark.png" width="110" alt="Koodal logo" />

# KOODAL · கூடல்

### One platform where any community **reports, verifies and resolves** its issues, in the open.

![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

[![Pitch Deck](https://img.shields.io/badge/📥_Pitch_Deck-Download_PDF-F5B30A?style=for-the-badge)](public/docs/Koodal_Platform_Pitch_Deck.pdf)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Coming_soon-E8590C?style=for-the-badge)](#-submission-checklist)
[![Demo Video](https://img.shields.io/badge/🎬_Demo_Video-Coming_soon-0F8B83?style=for-the-badge)](#-submission-checklist)

**Built by TEAM TRIOZ for [Build with AI: Code for Communities](https://hack2skill.com/event/codeforcommunities2)**

</div>

---

## 🏆 Hackathon

| | |
|---|---|
| **Event** | Build with AI: Code for Communities, a Google Cloud hackathon by GDG India on Hack2Skill |
| **Theme** | Solving for India: Indian developers, Indian problems, Indian scale |
| **Track** | **01 · AI for Digital Public Infrastructure & Governance** (Innovation) |
| **Prize pool** | INR 10 lakh + Google Cloud credits for top teams |
| **Register / details** | [hack2skill.com/event/codeforcommunities2](https://hack2skill.com/event/codeforcommunities2) |

> **The challenge:** governments struggle to consolidate citizen feedback and align it with infrastructure priorities. Requests live in fragmented systems, so spending is misaligned and gaps go unaddressed. Build a scalable, multilingual AI platform, designed as a Digital Public Good, that aggregates citizen requests and surfaces demand hotspots for policymakers.

## 💡 What is Koodal?

Koodal gives an organization its own space for issues: **members report and verify, the team assigns and fixes, and members confirm the result.** Cities, apartments, campuses and institutions all run on the same core. Members never pay; organizations subscribe.

This repo is the hackathon MVP (originally named CivicPulse), focused on the civic / government use case for Tamil Nadu.

**📖 See the deck in the app at `/pitch`, or [download the PDF](public/docs/Koodal_Platform_Pitch_Deck.pdf).**

## 🔁 The loop

```mermaid
flowchart LR
    A[📸 Member reports<br/>photo + language] --> B[✨ Gemini classifies,<br/>summarizes, routes]
    B --> C[🔍 AI flags<br/>similar nearby issues]
    C --> D[👥 Neighbours support<br/>and add evidence]
    D -->|80% threshold| E[📂 Official case opens]
    E --> F[🛠 Team decides,<br/>assigns, fixes]
    F --> G[✅ Members confirm<br/>before / after proof]
    G -.->|Not yet| E
```

1. **Report:** a photo, in the member's own language (the deck targets 12 Indian languages).
2. **AI suggests:** category, summary, severity and the department it goes to.
3. **AI detects:** similar nearby issues are flagged so duplicates are merged, not re-filed.
4. **Community supports:** neighbours upvote and add evidence. Crossing the verification threshold (80%) opens an official case.
5. **Team acts:** pending approval → assigned → in progress, with SLA breaches shown on the public case timeline.
6. **Members confirm:** before/after proof is posted and neighbours vote *Fixed* or *Not yet*. A rejected fix reopens the case.

## 🧠 How Google AI is used

| Where | What | Status |
|---|---|---|
| Gemini (`@google/generative-ai`, `lib/gemini.ts`) | Classify a report: category, severity, department, title, summary | ✅ Built |
| Gemini | Similar-issue / duplicate matching against nearby cases | ✅ Built |
| Google Maps Platform, BigQuery, Speech-to-Text, Translation API | Demand hotspots, voice and messaging intake, multilingual UI at national scale | 🗺 Roadmap |

## 🎯 Judging criteria → Koodal

| Weight | Criterion | Koodal's answer |
|---|---|---|
| 20% | Problem–solution fit | Turns scattered citizen complaints into verified, prioritized, tracked cases |
| 25% | AI / technical execution | Gemini classification and dedup wired into a working end-to-end report flow on Firestore |
| 20% | Depth & reach across India | Multi-tenant by design: any organization type, any language, any state |
| 15% | Impact potential | Community verification plus public SLA timelines make outcomes measurable |
| 20% | Deployability & scalability | Small stack (Next.js, Firebase, Gemini), deployable on Vercel or Cloud Run, PWA-ready |

## 🏗 Architecture

```mermaid
flowchart TB
    subgraph Client["Next.js App Router"]
      C1[Citizen app<br/>map · feed · report · cases]
      C2[Government / team views]
      C3[/pitch deck viewer/]
    end
    subgraph Server["Server"]
      S1[Server Actions<br/>Firestore writes]
      S2[/api/analyze/]
    end
    C1 --> S1
    C1 --> S2
    C2 --> S1
    S1 --> DB[(Firestore)]
    C1 -. realtime reads .-> DB
    S2 --> G[Gemini]
    DB -. planned .-> BQ[(BigQuery<br/>hotspot analytics)]
```

## 🧩 Product model

- **Members** report, support and verify issues. Members never pay.
- **Teams** (staff, admins, owner) review cases, assign work and post proof of the fix, with role-based access.
- **Organizations** subscribe by type: Government, Apartment or community, University or campus, Institution.
- **Platform admin** sees every tenant, its plan and its health; every action is audit-logged.

Plans and pricing are in [Business model & growth](#-business-model--growth) below.

## 📈 Business model & growth

**Organizations subscribe. Members never pay.** Priced by community size, at about ₹2–10 per member a month. Every plan starts with a 14-day free trial.

| Plan | Price | Limits | Who it's for |
|---|---|---|---|
| Starter | ₹999 / month | 100 members · 2 staff | Small apartments, clubs |
| Community | ₹2,499 / month | 500 members · 5 staff | Gated communities, schools |
| Institution | ₹6,999 / month | 3,000 members · 15 staff | Colleges, hospitals, offices |
| Civic | Custom / year | Unlimited · SSO · open data | Cities and large campuses |

### 3-year growth plan

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| **Annual recurring revenue** | **₹30 L** | **₹1 Cr** | **₹2.7 Cr** |
| Organizations | 73 | 271 | 735 |
| Footprint | 2 city pilots | 6 cities | 15 cities |

_These are targets, not results._

**How it grows**
- **Upgrades as communities grow:** plans are sized by members, so revenue grows with each org.
- **Members bring the next org:** one account across communities keeps acquisition cheap.
- **Add-ons:** WhatsApp and IVR reporting, SMS alerts, open-data exports.
- **Civic contracts anchor revenue:** yearly city deals, averaging about ₹7.8 L each.

> The platform-admin figures in the deck (8 paying organizations, ₹2.32 L MRR) come from demo/sample data, not real customers.

### Built vs roadmap

| ✅ Built in this repo | 🗺 Roadmap (shown in the deck) |
|---|---|
| Citizen app: nearby map and list, feed, search, cases, report flow, duplicate handling, profile, settings | Team/government workflow screens on live data |
| Gemini report analysis, Firestore persistence, email/password auth | Multi-tenant organizations, billing, platform admin |
| | Voice / WhatsApp intake, 12-language UI, policymaker hotspot analytics |

## 🗓 Hackathon timeline

| Date (2026) | Milestone |
|---|---|
| 11 Aug – 30 Sep | Registration, team formation and prototype submission |
| 1 – 15 Oct | Prototype evaluation |
| 16 Oct | Top 20 shortlist announced |
| 23 Oct | Virtual Demo Day |
| Oct (TBA) | In-person Demo Day |

## ✅ Submission checklist

- [x] Source code: this repository
- [x] Pitch deck: [`public/docs/Koodal_Platform_Pitch_Deck.pdf`](public/docs/Koodal_Platform_Pitch_Deck.pdf) (20 slides, also at `/pitch`)
- [ ] Demo video (3–5 min): _TODO_
- [ ] Deployed link: _TODO_
- [ ] 2–3 line description: _TODO_

## 👥 Team TRIOZ

| | Member | Role |
|---|---|---|
| 🧭 | **Santhosh S** | Team Leader |
| 💻 | **Aakash T** | Team Member |

---

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

- `app/pitch/` — `/pitch`: the platform pitch deck viewer with PDF download (`public/docs/`).
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
