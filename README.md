# Expense Tracker

A web app for tracking spending, income, and budgets. The UI is built with Next.js and Tailwind CSS, using mock data until a backend is connected.

## Tech stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **UI:** [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) v4
- **Language:** TypeScript
- **Linting:** ESLint (`eslint-config-next`)

## Features

- Responsive **dashboard shell** with sidebar and top bar (mobile-friendly navigation)
- **Summary cards:** total balance, monthly expenses, monthly income, savings (mock values)
- **Recent expenses** table: category, amount, date, payment method (mock data; card layout on small screens, table on larger viewports)
- Placeholder routes for **Expenses**, **Categories**, **Budgets**, **Reports**, and **Settings**

## Run locally

Prerequisites: [Node.js](https://nodejs.org/) (LTS recommended) and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run build` then `npm run start` for a production build.

## Project structure

```
app/                    # App Router: layouts, pages, global styles
  layout.tsx            # Root layout + dashboard shell
  page.tsx              # Dashboard (summary + expenses section)
  globals.css
  expenses/             # Route placeholders
  categories/
  budgets/
  reports/
  settings/

components/
  shell/                # App-wide layout (e.g. dashboard-layout)
  ui/                   # Reusable primitives (e.g. summary-card)
  expenses/             # Expense-specific UI + mock data
```

Path alias `@/*` is configured in `tsconfig.json` for imports from the repository root.

## Future improvements

- Persist expenses and categories (database + API routes or server actions)
- Authentication and multi-user workspaces
- Charts and reporting on the **Reports** page
- Budgets with alerts and period comparisons
- CSV import/export and optional bank connections
