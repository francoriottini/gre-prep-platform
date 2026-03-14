# Security Policy

## Supported Versions

Only the latest `main` branch is actively supported.

## Reporting a Vulnerability

If you find a security issue, do not open a public issue with exploit details.

Report privately to the maintainer with:

- impact
- reproduction steps
- affected endpoint/file
- suggested fix (optional)

## Secret Handling Rules

- Never commit `.env.local` or production credentials.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
- Rotate Supabase keys immediately if leaked.
- Do not use shared browser admin secrets. Admin access should use Supabase auth plus membership in `public.admin_users`.
- Prefer anon-key plus user JWT clients for authenticated user routes. Keep service role usage narrow and server-only.

## Pre-Publish Checklist

Before making repo public:

1. Verify `.env.local` is not tracked.
2. Scan repository for keys/tokens.
3. Confirm no personal data in sample content.
4. Confirm no copyrighted GRE prep content in question bank.
