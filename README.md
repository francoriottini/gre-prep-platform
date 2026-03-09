# GRE Quant Gratis

Free GRE Quant practice platform focused on Latin America and low-income contexts.

This repo is public and safe to share if secrets stay only in local/hosting env vars.

## Start Here

If you are new to the project, read these files in order:

1. `docs/HANDOFF_NOTE.md` - one-page context for a new conversation
2. `docs/PROJECT_BRIEF.md` - vision, scope, success criteria, current status
3. `docs/ROADMAP.md` - what to build next (priority order)
4. `docs/ARCHITECTURE.md` - routes, APIs, data model, security boundaries
5. `docs/RUNBOOK.md` - exact technical steps (local, Supabase, deploy)
6. `docs/CONTENT_OPERATIONS.md` - question pipeline + social outreach workflow

## Current Product Scope (V1)

- Bilingual UI (`es` / `en`)
- English question content with EN + ES explanations
- Customizable timed quizzes
- Optional login + guest mode
- Progress dashboard
- Item-level feedback
- Supabase backend with RLS

## Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (Auth + Postgres + RLS)
- Vercel-compatible route handlers

## Quick Start

1. Install Node.js `20+`
2. Copy `.env.example` to `.env.local`
3. Fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_KEY=
```

4. Run SQL schema in Supabase:

- `supabase/schema.sql`

5. Run app:

```bash
npm install
npm run validate:bank
npm run import:questions
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run validate:bank`
- `npm run import:questions`
- `npm run test:content`
- `npm run security:scan`

## API Endpoints (V1)

- `POST /api/quiz/generate`
- `POST /api/attempt/submit`
- `GET /api/progress/summary`
- `POST /api/item-feedback`
- `GET|PATCH /api/admin/questions`

## Non-negotiables

- Only original questions (`source_type=original`)
- No copied/adapted ETS or commercial prep content
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code

## Legal Notice

This is an independent educational project.
It is not affiliated with ETS and does not provide official GRE score equivalence.

## License

MIT - see `LICENSE`.
