# Architecture

## High-level

- Frontend: Next.js App Router
- Backend: Next.js route handlers (serverless style)
- Database/Auth: Supabase Postgres + Supabase Auth
- Security model: RLS + service role used only server-side

## App Routes

- `/` - quiz builder
- `/quiz` - quiz runner with timer
- `/results` - answer review + feedback
- `/dashboard` - progress summary
- `/login` - optional magic-link auth
- `/admin` - lightweight review UI (admin key protected endpoint)

## API Routes

- `POST /api/quiz/generate`
  - Inputs: topic/subtopic/difficulty/count/time limit
  - Output: quiz payload (without correct answers)

- `POST /api/attempt/submit`
  - Inputs: answers + per-item time
  - Output: corrections + summary metrics
  - Side effects: stores attempt + updates snapshots if authenticated

- `GET /api/progress/summary`
  - Output: overall + by-topic + weekly trend
  - Guest mode returns guest-safe shape

- `POST /api/item-feedback`
  - Inputs: question id + feedback type + optional comment/vote
  - Output: insert acknowledgement

- `GET|PATCH /api/admin/questions`
  - Admin list/update endpoint via `x-admin-key`

## Core Tables

- `questions`
- `quiz_attempts`
- `attempt_items`
- `user_profiles`
- `mastery_snapshots`
- `item_feedback`

See `supabase/schema.sql` for full constraints, indexes, and policies.

## Auth Modes

- Guest:
  - no account required
  - attempts saved in local storage summary

- Authenticated:
  - magic link login
  - attempts and progress saved in Supabase

## Data Safety Boundaries

- `SUPABASE_SERVICE_ROLE_KEY` is server-only
- Browser client uses public key only
- `questions` table client access is blocked by RLS policies

## Known Technical Debt

- Need stronger rate limiting on public APIs
- Need stronger anti-abuse controls in feedback endpoint
- Need stronger session persistence behavior for timer edge cases
