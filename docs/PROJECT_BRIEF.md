# Project Brief

## Mission

Build a high-quality, free GRE practice platform for people in Latin America and low-income contexts.
The long-term benchmark is "Magoosh-like learning quality", with legal-safe original content and low friction access.

## Problem

Many GRE prep options are expensive and not optimized for Spanish-speaking students.
The project aims to reduce cost barriers while keeping serious practice quality.

## Target Users

- Primary: LatAm students applying to graduate programs
- Secondary: learners in other low-income settings
- Device priority: mobile-first, then desktop
- Language: UI in ES/EN, GRE content in English

## Product North Star

By default, a learner should be able to:

1. start practice in under 60 seconds
2. get immediate correction + explanations
3. track progress over time
4. identify weak topics

## Scope

### V1 (current track)

- Quant only
- Topic/subtopic/difficulty quiz builder
- Timed quizzes
- Review mode with explanations (EN + ES)
- Guest mode + optional auth
- Progress dashboard
- Feedback per item

### V2 (future)

- Full exam simulation mode
- Better score prediction/calibration
- Verbal + AWA modules
- Personalized study plans

## Non-goals (for now)

- Claiming official GRE score equivalence
- Copying ETS/commercial prep question banks
- Building an all-subject platform from day one

## Legal and Ethics Constraints

- Every item must be original (`source_type=original`)
- No ETS/Magoosh/Kaplan/Manhattan copied or lightly rewritten material
- Contributor authorship statement is mandatory for crowdsourced content

## Current Implementation Status

### Done

- Working Next.js app with UI flow
- Supabase schema + RLS + APIs
- Quiz generation, submission, progress summary
- Local guest progress fallback
- Admin review endpoint
- Content validation and import scripts

### Pending for public beta quality

- Larger question bank (target: 200+ quant items minimum)
- Better UX polish (exam focus mode, clearer progress UX)
- Better resilience (network retries, rate limiting, error UX)
- Metrics and observability for production

## Definition of "MVP Public"

The project is considered MVP-public ready when all conditions below are true:

1. Deployed and stable on a public URL
2. At least 200 published original Quant questions
3. End-to-end flow works on mobile and desktop
4. No critical security issues
5. Contributor pipeline is active and legally safe

## Decision Log (high-level)

- Repo is separate from personal website repo
- Codebase is open-source; curated question bank can remain controlled
- Supabase is the data/auth backend
- Vercel is the recommended deployment target
