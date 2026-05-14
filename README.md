# Voxify — AI Text-to-Speech Platform

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19-087EA4?style=for-the-badge&logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![tRPC](https://img.shields.io/badge/tRPC-API-2596BE?style=for-the-badge&logo=trpc&logoColor=white) ![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Modal](https://img.shields.io/badge/Modal-GPU%20Inference-111827?style=for-the-badge) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white) ![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white) ![OpenAPI](https://img.shields.io/badge/OpenAPI-Typegen-6BA539?style=for-the-badge)

![Voxify](./public/mockup.png)

Built a production-ready AI voice platform that lets creators, businesses, and developers generate realistic speech audio at scale; fast, clean, and API-ready.

## What the platform does

- Multi-voice generation with controllable parameters (temperature, top-p, top-k, repetition penalty)
- Organization-based voice management (system voices + per-org custom voices)
- Low-latency audio generation and playback (streamed audio via API)
- Developer-friendly APIs (Next.js Route Handlers + tRPC), plus a typed client to the inference service (OpenAPI)
- Audio storage + delivery via Cloudflare R2 (S3-compatible) with signed URLs

## Stack

- Next.js (App Router) + TypeScript + React
- Prisma (PostgreSQL via `@prisma/adapter-pg` + `pg`)
- REST API (Next Route Handlers) + tRPC
- Python FastAPI service on Modal (GPU A10G) for TTS inference
- OpenAPI typegen + typed client (`openapi-typescript` + `openapi-fetch`)
- Auth & Org (Clerk)
- Object Storage (Cloudflare R2 via AWS S3 SDK + signed URLs)
- UI (Tailwind CSS + shadcn/ui + Radix)
- Validation (Zod)
- Data fetching/state (TanStack React Query)

## Architecture (flow)

```mermaid
flowchart LR
  subgraph Client
    U[User Browser]
    UI[Dashboard UI]
    U --> UI
  end

  subgraph App[Next.js App Router]
    API[API Routes and tRPC]
    Auth[Clerk Auth and Org]
    UI --> API
    API --> Auth
  end

  subgraph Data[Data Layer]
    DB[(Postgres)]
    R2[Cloudflare R2]
  end

  subgraph Inference[Inference Layer]
    M[Modal FastAPI Service]
    Model[Chatterbox TTS Model]
    M --> Model
  end

  Auth -->|user session and orgId| API
  API -->|Prisma read write| DB

  %% Voice upload and management
  API -->|upload voice audio| R2
  API -->|save voice metadata| DB

  %% TTS generation
  API -->|POST generate| M
  M -->|read voice prompt audio| R2
  M -->|return wav bytes| API
  API -->|store generation audio| R2
  API -->|save generation record| DB

  %% Playback
  UI -->|GET api audio generationId| API
  API -->|signed url| R2
  R2 -->|wav stream| UI
```

### Key flows

- Voice upload: UI -> API -> R2, then API -> DB
- Generate TTS: UI -> tRPC -> Modal, then API stores WAV to R2 and metadata to DB
- Playback: UI requests `/api/audio/:generationId`, API returns a streamed WAV from R2

## Getting started

### Prerequisites

- Node.js (recommended: latest LTS)
- Postgres database
- Cloudflare R2 credentials + bucket
- Clerk application keys
- A running Chatterbox inference API (Modal) or your own compatible endpoint

### Clone & install

```bash
git clone https://github.com/Ryanakml/Voxify.git
cd Voxify
npm install
```

### Environment variables

Create a `.env` in the project root. Minimum variables used by the code:

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB

# Cloudflare R2 (S3-compatible)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...

# Chatterbox inference API (Modal FastAPI)
CHATTERBOX_API_URL=https://your-modal-app.modal.run
CHATTERBOX_API_KEY=...

# Clerk (typical Next.js + Clerk env vars)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### Database migrations + seed

```bash
npx prisma migrate dev
npm run seed
```

### Sync OpenAPI types (optional but recommended)

This fetches `${CHATTERBOX_API_URL}/openapi.json` and regenerates the typed client types.

```bash
npm run sync:api
```

### Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Notes: Modal inference service

The inference service lives in `chatterbox_tts.py` and is designed to run on Modal with an A10G GPU.

- It expects an API key via `x-api-key` header
- It reads voice prompt audio from a Cloudflare R2 bucket mounted into Modal

If you change the inference API base URL, update `CHATTERBOX_API_URL` and rerun `npm run sync:api`.
