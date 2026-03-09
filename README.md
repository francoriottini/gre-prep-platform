# GRE Quant Gratis

Free GRE Quant practice platform focused on Latin America and low-income contexts.

Current version includes:

- bilingual UI (`es`/`en`)
- customizable timed quizzes
- optional auth + guest mode
- progress dashboard
- item-level feedback
- Supabase-backed API + RLS

## Public Repo Status

This repository is safe to publish if you keep secrets in local/env hosting variables only.

Never commit:

- `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY`
- any `sb_secret_*` key
- production tokens

## Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Auth + Postgres + RLS)
- Vercel-compatible serverless routes

## Quick Start

1. Install Node.js `20+`
2. Copy `.env.example` to `.env.local`
3. Fill required env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_KEY=
```

4. Create database objects in Supabase SQL Editor with:

- `supabase/schema.sql`

5. Run locally:

```bash
npm install
npm run validate:bank
npm run import:questions
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - local app
- `npm run build` - production build
- `npm run lint` - lint checks
- `npm run validate:bank` - question bank validation
- `npm run import:questions` - import question bank into Supabase
- `npm run test:content` - content validation tests

## API Endpoints (V1)

- `POST /api/quiz/generate`
- `POST /api/attempt/submit`
- `GET /api/progress/summary`
- `POST /api/item-feedback`

## Question Contribution Policy

- Only original questions are accepted.
- No ETS/Magoosh/Kaplan/Manhattan copied content.
- All submissions require:
  - stem
  - choices A-E
  - one correct choice
  - explanation in EN + ES
  - topic/subtopic/difficulty
  - authorship statement

See `CONTRIBUTING.md` for details.

## Legal Notice

This project is an independent educational tool and is not affiliated with ETS.
It does not provide official GRE scoring equivalence.

## License

MIT - see `LICENSE`.
