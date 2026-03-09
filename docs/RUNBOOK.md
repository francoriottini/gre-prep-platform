# Runbook

Operational guide for local development, Supabase setup, deployment, and sanity checks.

## 1) Local Setup

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_KEY=
```

Run:

```bash
npm run validate:bank
npm run import:questions
npm run dev
```

## 2) Supabase Setup

1. Open Supabase project
2. SQL Editor -> run `supabase/schema.sql`
3. Auth -> URL configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`
4. API keys:
   - `NEXT_PUBLIC_SUPABASE_URL` <- Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` <- publishable/anon key
   - `SUPABASE_SERVICE_ROLE_KEY` <- secret or service role key

## 3) Pre-publish Security Checks

Run before any push:

```bash
npm run security:scan
npm run test:content
npm run build
npm run lint
```

Manual checks:

- `.env.local` is not tracked
- no personal data in question files
- no copyrighted prep content in question bank

## 4) Vercel Deployment

1. Import repo in Vercel
2. Add environment variables from `.env.local`
3. Set production Auth URLs in Supabase:
   - Site URL: production domain
   - Redirect URLs:
     - `https://your-domain/**`
     - `https://*-your-team.vercel.app/**` (if preview environments are used)
4. Deploy

## 5) Post-deploy Smoke Test

Checklist after each production deployment:

1. Open home page
2. Generate quiz
3. Answer and submit quiz
4. Open results page with explanations
5. Open progress dashboard
6. Test login magic link flow
7. Submit item feedback

## 6) Content Ops Quick Commands

```bash
npm run validate:bank
npm run import:questions
```

Optional custom file:

```bash
node scripts/validate-question-bank.mjs content/my-file.json
node scripts/import-questions.mjs content/my-file.json
```

## 7) Incident Response (basic)

If a secret leaks:

1. rotate key in Supabase immediately
2. update env vars in Vercel/local
3. invalidate old credentials
4. scan git history if needed

If malicious content is reported:

1. unpublish affected questions
2. review contributor source and approval chain
3. document root cause and add validation guardrail
