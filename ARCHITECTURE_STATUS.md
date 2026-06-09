# Architecture Status

## Status

Current architecture status: Stable and mostly consistent.

This file is the current source of truth for architecture status. Older review documents may contain outdated findings.

---

## Current Layer Responsibilities

### app/*

Route pages and layouts.

Responsibilities:

* Define routes
* Fetch initial server data
* Compose feature components

Examples:

```txt
app/page.tsx
app/expenses/page.tsx
app/categories/page.tsx
app/reports/page.tsx
```

---

### app/actions/*

Server Actions layer.

Responsibilities:

* Validate input using Zod schemas
* Call lib data functions
* Handle try/catch
* Call revalidatePath
* Return structured responses

Rules:

* No Prisma usage
* No UI logic
* No toast
* No Prisma relation syntax

---

### components/*

UI layer.

Responsibilities:

* Render UI
* Manage client state
* Call server actions
* Show toast/loading/error states

Current feature folders:

```txt
components/expenses
components/categories
components/reports
components/ui
components/shell
```

---

### lib/*

Shared logic layer.

Current modules:

```txt
lib/expenses.ts       -> expense data access
lib/categories.ts     -> category data access
lib/stats.ts          -> dashboard/report aggregation
lib/formatters.ts     -> formatting utilities
lib/utils.ts          -> shared helpers
lib/validations/*     -> Zod schemas
```

Rules:

* Prisma is allowed only in data/aggregation modules.
* Zod schemas must not call Prisma.
* Formatters and utils must remain pure.
* Resource data functions should accept flat DTO-style inputs.

---

## Completed Architecture Improvements

* Expenses actions now call lib/expenses instead of Prisma directly.
* Expense and category lib functions use DTO-style inputs.
* Redundant report logic was removed from lib/expenses.
* Reports and dashboard stats are centralized in lib/stats.
* Shared formatting utilities were added in lib/formatters.
* Dashboard and expenses page responsibilities were separated.
* Categories client view was moved to components/categories.
* Reusable UI primitives were added in components/ui.
* Zod validation schemas were added.
* Error boundaries were added.
* Pending/loading states were added for server actions.

---

## Current Route Responsibilities

```txt
/           -> dashboard overview
/expenses   -> full expense management
/categories -> category management
/reports    -> reports and charts
```

---

## Known Remaining Cleanup Tasks

### 1. Remove legacy expense mutation field

The legacy `category: string` field should be removed from expense mutation types and Zod schemas if confirmed unused.

### 2. Pass categories from server page

`components/expenses/dashboard-expenses-section.tsx` may still fetch categories from a server action on mount.

Preferred pattern:

```txt
app/expenses/page.tsx
→ fetch expenses and categories on server
→ pass both into client component
```

### 3. Rename DashboardExpensesSection

The component name may be outdated after separating dashboard and expenses pages.

Possible future name:

```txt
ExpensesManagementSection
```

### 4. Improve DTO serialization boundaries

`lib/expenses.ts` may still return Prisma objects with full category relations. Current pages transform data before passing to clients, but stricter DTO returns could improve long-term clarity.

### 5. Extract remaining UI patterns

Potential future shared components:

```txt
EmptyState
Select
Modal/Dialog wrapper
FormField
```

### 6. Move magic constants

Example:

```txt
ITEMS_PER_PAGE = 10
```

could be moved to a shared config later.

---

## Architecture Rule

When documentation conflicts with current code, current code wins.
