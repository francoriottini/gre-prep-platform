# Handoff Note (for new conversations)

Use this file when starting a new chat with an engineer/assistant.

## Project intent

This project aims to become a free, high-quality, legally safe GRE prep platform for LatAm users, starting with Quant.

## What is already done

- Working web app flow: quiz builder -> timed quiz -> results -> progress
- Supabase schema + RLS
- Admin access now uses authenticated membership via `admin_users`
- Question validation + import scripts
- Security scan script

## What should be done next

Priority order:

1. Hardening fixes (timer/session edge cases, unanswered behavior, rate limiting)
2. Content expansion to 200+ original Quant questions
3. UX polish for mobile + exam focus mode
4. Public beta + contributor pipeline

## Must-respect constraints

- No copied ETS or commercial prep content
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only
- Keep repo public-safe (no secret leakage)
- Keep EN + ES explanations for question quality

## File map for orientation

- Product goals: `docs/PROJECT_BRIEF.md`
- Build plan: `docs/ROADMAP.md`
- Technical operations: `docs/RUNBOOK.md`
- Architecture: `docs/ARCHITECTURE.md`
- Content operations and outreach: `docs/CONTENT_OPERATIONS.md`

## If you only read one thing

Read `docs/PROJECT_BRIEF.md` first, then execute from `docs/ROADMAP.md`.
