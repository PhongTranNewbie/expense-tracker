# AGENTS.md

# AI Agent Rules

## Project Goal

This is a portfolio-quality Expense Tracker built with:

* Next.js App Router
* TypeScript
* Prisma
* Tailwind CSS
* Server Actions
* Zod validation

The project should remain beginner-friendly, maintainable, and production-style without becoming overengineered.

---

## General Workflow

Before editing code:

1. Read existing code first.
2. Analyze the current implementation.
3. Identify affected files.
4. Explain the implementation plan briefly.
5. Then implement step by step.

Do not immediately generate code.

---

## Source of Truth Rule

Documentation may be outdated.

When documentation conflicts with the current codebase:

* Treat the current codebase as the source of truth.
* Mention outdated documentation before editing.
* Do not reintroduce already-fixed technical debt.
* Do not assume old architecture review notes are still accurate.

---

## Coding Rules

* Preserve the current architecture.
* Avoid unnecessary refactors.
* Reuse existing components, libraries, and utilities first.
* Do not introduce new dependencies unless necessary.
* Keep code beginner-friendly and maintainable.
* Prefer simple solutions over complex abstractions.
* Do not modify unrelated files.
* Keep components and functions focused and small.
* Avoid broad rewrites when an incremental change is enough.

---

## Architecture Rules

The project uses a layered architecture.

### app/*

Route files and layouts live here.

Rules:

* Route pages should generally be Server Components.
* Server Components fetch initial data.
* Avoid placing large interactive Client Components directly in route folders unless intentionally route-specific.
* Route pages should compose feature components from `components/*`.

Example:

```txt
app/expenses/page.tsx
  -> fetches data
  -> renders components/expenses/*
```

---

### app/actions/*

Server Actions layer.

Responsibilities:

* Validate input.
* Call lib data functions.
* Handle try/catch.
* Call `revalidatePath`.
* Return structured responses:

```ts
{
  success: boolean;
  data?: T;
  error?: string;
}
```

Rules:

* Do NOT use Prisma directly here.
* Do NOT contain Prisma relation syntax such as `{ connect: ... }`.
* Do NOT put UI logic here.
* Do NOT call toast or browser APIs here.

---

### components/*

UI layer.

Responsibilities:

* Render UI.
* Manage client-side state and interactivity.
* Call server actions for mutations.
* Show toast/error/loading states.

Rules:

* No Prisma usage.
* No database logic.
* No direct database fetching.
* Feature UI components should live in:

```txt
components/[feature]/*
```

* Reusable UI primitives should live in:

```txt
components/ui/*
```

Examples:

```txt
components/expenses/*
components/categories/*
components/reports/*
components/ui/*
```

---

### lib/*

Shared logic layer.

Different files inside `lib/` have different responsibilities.

#### lib/[resource].ts

Resource data modules.

Examples:

```txt
lib/expenses.ts
lib/categories.ts
```

Responsibilities:

* Database/data access for that resource.
* Prisma usage is allowed here.
* Accept flat DTO-style inputs.
* Convert flat DTOs into Prisma schema shape internally.
* Throw errors for callers to handle.

Rules:

* No validation.
* No `revalidatePath`.
* No UI logic.
* No toast.
* No React.
* Do not expose Prisma relation shapes outside these modules.
* Do not expose Prisma generated input types as public function input contracts.

---

#### lib/stats.ts

Analytics and aggregation module.

Responsibilities:

* Server-side aggregation.
* Dashboard statistics.
* Report/chart data preparation.
* Return serialization-safe plain objects.

Rules:

* May use Prisma internally.
* Should not return raw Prisma objects to client components unless transformed safely.

---

#### lib/validations/*

Validation schema modules.

Responsibilities:

* Zod schemas.
* Inferred TypeScript types from Zod schemas.

Rules:

* No Prisma usage.
* No database calls.
* No `revalidatePath`.
* No UI logic.
* No React.
* Keep schemas simple and readable.

---

#### lib/formatters.ts

Formatting utilities.

Responsibilities:

* Currency formatting.
* Date formatting.
* Chart label formatting.

Rules:

* Pure functions only.
* No React.
* No database logic.

---

#### lib/utils.ts

Generic helper utilities.

Responsibilities:

* Small shared utility helpers such as className merging.

Rules:

* Keep generic.
* Avoid dumping business logic here.

---

## Prisma Boundary Rules

Prisma should be isolated to data/aggregation modules only.

Allowed:

```txt
lib/expenses.ts
lib/categories.ts
lib/stats.ts
lib/db.ts
```

Not allowed:

```txt
components/*
app/actions/*
lib/validations/*
lib/formatters.ts
```

Rules:

* Prisma relation syntax such as `{ connect: { id } }` must not appear outside resource data modules.
* Server Actions must pass flat data such as `categoryId`.
* Resource data modules are responsible for mapping flat DTOs to Prisma fields.
* Avoid exposing Prisma generated input types as function inputs.

Example:

Wrong in actions:

```ts
category: { connect: { id: categoryId } }
```

Correct in actions:

```ts
categoryId
```

Correct in lib resource module:

```ts
prisma.expense.create({
  data: {
    categoryId: data.categoryId,
    amount: data.amount,
    date: data.date,
    paymentMethod: data.paymentMethod,
  },
});
```

---

## Validation Rules

* Server-side validation should happen in `app/actions/*`.
* Zod schemas live in `lib/validations/*`.
* Client-side validation is for UX only.
* Zod validation is the server-side source of truth.
* Use `safeParse()` in server actions for user-submitted data.
* Return user-friendly error messages.
* Do not leak raw stack traces or internal errors to the UI.

---

## UI / Styling Rules

* Reuse the existing design system.
* Prefer components from `components/ui/*`.
* Preserve current spacing and layout patterns.
* Avoid unnecessary visual redesigns.
* Verify responsive behavior.
* Verify dark mode compatibility.
* Keep UI changes incremental.

---

## Next.js Rules

* Follow existing App Router patterns.
* Reuse current providers and layouts.
* Avoid breaking server/client boundaries.
* Server Components fetch initial data.
* Client Components handle interactivity.
* Keep server actions and database logic separated from UI components.
* Avoid client-side data fetching when the route Server Component can fetch initial data and pass it as props.

---

## Refactor Safety Rules

When modifying existing code:

* Check for similar existing patterns first.
* Prefer consistency over cleverness.
* Avoid rewriting working code.
* Refactor incrementally.
* Preserve current UI behavior unless explicitly requested.
* Avoid touching multiple domains at once.
* Verify imports and types after changes.
* Search for affected references before removing fields or functions.

---

## Documentation Rule

If asked to use documentation files such as:

```txt
PROJECT_CONTEXT.md
ARCHITECTURE_REVIEW.md
ARCHITECTURE_STATUS.md
```

then:

1. Read them.
2. Compare them against the current code.
3. Identify outdated statements.
4. Treat current code as the source of truth.
5. Do not blindly follow outdated review notes.

---

## Safety Checks

After implementing changes:

* Check TypeScript errors.
* Check imports and exports.
* Verify client/server component boundaries.
* Verify Tailwind styling integration.
* Verify Prisma/schema changes if applicable.
* Run:

```bash
npx tsc --noEmit
```

For larger structural changes, also run:

```bash
npm run build
```

Do not claim verification passed unless the command actually ran successfully.

---

## Important

If unsure:

* Analyze more first.
* Ask for clarification.
* Avoid guessing architecture.
* Prefer the smallest safe change.
