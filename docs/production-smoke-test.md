# Production Smoke Test Checklist

Use this checklist after a Vercel production deployment. It is intentionally manual and does not require sharing secrets with an agent.

## Safe unauthenticated checks

- Open the production home page.
- Open `/login` and confirm the GitHub sign-in entry point appears.
- Open protected routes such as `/expenses`, `/categories`, and `/reports` in a signed-out browser session and confirm they redirect to `/login`.
- Open `/api/auth/providers` and confirm it responds with the configured provider metadata. Do not print or paste secrets.

## Authenticated checks

- Sign in with the production GitHub OAuth app.
- Confirm the dashboard loads for the signed-in user.
- Create a temporary category.
- Create a temporary expense in that category.
- Edit the temporary expense.
- Confirm dashboard and reports reflect only the signed-in user's data.
- Delete the temporary expense.
- Delete the temporary category.

## Safety notes

- Do not run `prisma migrate dev`, `prisma db seed`, `prisma db push`, or `prisma migrate reset` against production or shared Neon.
- Keep Vercel production environment variables separate from local `.env` values.
- Keep local and production GitHub OAuth apps separate.
- Keep local SQLite `.db` files archived, ignored, and inactive.
