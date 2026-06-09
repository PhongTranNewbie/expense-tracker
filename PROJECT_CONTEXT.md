# Project Context

## Stack

* Next.js 16
* TypeScript
* Prisma
* Tailwind CSS
* App Router
* Server Actions
* Zod
* Sonner toast

---

## Project Goals

* Portfolio-quality Expense Tracker
* Beginner-maintainable architecture
* Clean and understandable codebase
* Stable and predictable project structure
* Production-style UX without overengineering

---

## Current Features

* Dashboard overview page
* Expenses CRUD
* Categories CRUD
* Reports and charts
* Real database-backed dashboard stats
* Dark mode/theme support
* Loading and empty states
* Zod server-side validation
* Toast notifications
* Pending/loading states for actions
* Custom confirmation dialog
* Error boundaries
* Shared UI primitives

---

## Current Architecture

The project follows a layered architecture:

```txt
Server Page
→ Client Component
→ Server Action
→ lib data function
→ Prisma
```

Main folders:

```txt
app/
  actions/
  page.tsx
  expenses/page.tsx
  categories/page.tsx
  reports/page.tsx

components/
  ui/
  expenses/
  categories/
  reports/
  shell/

lib/
  expenses.ts
  categories.ts
  stats.ts
  formatters.ts
  utils.ts
  validations/
```

---

## Development Philosophy

* Small scoped changes
* Incremental improvements
* Avoid overengineering
* Prefer readability over cleverness
* Keep the project easy to debug
* Treat current code as source of truth
* Documentation may be outdated and must be checked against code

---

## Preferred Workflow

1. Analyze current implementation
2. Review relevant files only
3. List affected files
4. Explain implementation plan briefly
5. Implement step by step
6. Verify functionality
7. Run typecheck or build

---

## Important Notes

* Preserve current architecture unless there is a clear reason to change it.
* Reuse existing components and utilities whenever possible.
* Avoid massive refactors for small features.
* Keep Server Components responsible for initial data fetching.
* Keep Client Components responsible for interactivity.
* Keep Prisma usage inside `lib/[resource].ts`, `lib/stats.ts`, and `lib/db.ts`.
* Keep Zod validation schemas inside `lib/validations/*`.
* Do not mix Prisma access into validation or utility modules.
* Do not mix validation logic into resource data modules (`lib/expenses.ts`, `lib/categories.ts`, etc.).
* Prefer passing initial data from Server Components to Client Components instead of fetching on client mount when possible.