# Expense Tracker

A portfolio-style expense tracker built with Next.js, Prisma, Tailwind CSS, Server Actions, Zod validation, and Auth.js GitHub OAuth.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **UI:** [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) v4
- **Language:** TypeScript
- **Data:** Prisma + Neon PostgreSQL
- **Auth:** Auth.js / NextAuth v5 with GitHub OAuth
- **Linting:** ESLint (`eslint-config-next`)

## Features

- Responsive **dashboard shell** with sidebar and top bar (mobile-friendly navigation)
- GitHub login/logout
- User-owned categories and expenses
- Dashboard summary stats and reports scoped to the signed-in user
- Default categories for new users

## Run locally

Prerequisites: [Node.js](https://nodejs.org/) (LTS recommended) and npm.

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Fill in `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/DATABASE?sslmode=require"
AUTH_SECRET="your-auth-secret"
AUTH_URL="http://localhost:3000"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
```

`DATABASE_URL` is the pooled Neon connection used by the application and Vercel. `DIRECT_URL` is the unpooled connection used by Prisma Migrate. Preserve any additional TLS parameters supplied by Neon, such as `channel_binding=require`, when configuring real URLs.

4. Set up an empty, disposable development database:

```bash
npx prisma migrate dev
npx prisma db seed
```

Never run `prisma migrate dev` against production. The seed clears existing expense and category data, so run it only against a disposable development database.

## Production database migrations

Production migrations must be applied with:

```bash
npx prisma migrate deploy
```

You can check production migration status with:

```bash
npx prisma migrate status
```

Never run these commands against production or shared Neon databases:

```bash
npx prisma migrate dev
npx prisma db seed
```

## Production deployment status

The app is deployed on Vercel using Neon PostgreSQL. Prisma is configured with the PostgreSQL datasource in `prisma/schema.prisma`, and production database changes should continue to use `npx prisma migrate deploy`.

Vercel production environment variables should stay separated from local development values:

- `DATABASE_URL`: pooled Neon runtime connection
- `DIRECT_URL`: unpooled Neon migration connection
- `AUTH_URL`: production app URL
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` from the production GitHub OAuth app

Keep the local GitHub OAuth app separate from the production GitHub OAuth app so callback URLs and credentials do not get mixed. The local SQLite `.db` files are inactive archives only; do not use them for the PostgreSQL production workflow.

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run build` then `npm run start` for a production build.

## GitHub OAuth setup

Create a GitHub OAuth app in GitHub Developer Settings.

For local development, use:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Copy the GitHub OAuth app client ID and client secret into `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`.

Generate `AUTH_SECRET` with:

```bash
npx auth secret
```

If that command updates `.env.local`, copy the generated value into `.env`.

## Project structure

```
app/                    # App Router: layouts, pages, global styles
  layout.tsx            # Root layout + dashboard shell
  page.tsx              # Dashboard (summary + expenses section)
  globals.css
  expenses/
  categories/
  budgets/
  reports/
  settings/

components/
  shell/                # App-wide layout (e.g. dashboard-layout)
  ui/                   # Reusable primitives (e.g. summary-card)
  expenses/             # Expense-specific UI
```

Path alias `@/*` is configured in `tsconfig.json` for imports from the repository root.

## Future improvements

- Budgets with alerts and period comparisons
- CSV import/export and optional bank connections

## Post-deployment follow-up roadmap

- Run a production smoke test after each deployment: login, create category, create expense, edit expense, delete expense, view dashboard, and view reports.
- Add Auth/user ownership regression coverage for cross-user category and expense isolation.
- Replace the Google Fonts runtime dependency with a local font fallback if restricted build environments continue to block `fonts.googleapis.com`.
- Convert the old SQLite smoke script to the guarded PostgreSQL workflow or remove it entirely.
- Consider a future migration from `Float` to `Decimal` for `Expense.amount`.
- Add optional CI checks for `npx tsc --noEmit`, `npx prisma validate`, and `npm run build`.
- Add optional E2E coverage for login and CRUD using a safe test account/environment.
- Keep local SQLite files archived, ignored, and inactive.
