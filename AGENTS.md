# AI Agent Rules

## General Workflow

- Read existing code before editing.
- Analyze the current implementation first.
- Do not immediately generate code.
- Understand the architecture and existing patterns before making changes.

---

## Coding Rules

- Preserve the current architecture.
- Avoid unnecessary refactors.
- Reuse existing libraries and utilities first.
- Do not introduce new dependencies unless necessary.
- Keep code beginner-friendly and maintainable.
- Prefer simple solutions over complex abstractions.
- Do not modify unrelated files.
- Keep components and functions focused and small.

---

## Implementation Process

Before coding:

1. Analyze the relevant files.
2. List affected files.
3. Explain the implementation plan briefly.
4. Then implement step by step.

---

## Safety Checks

After implementing changes:

- Check for TypeScript errors.
- Check imports and exports.
- Verify client/server component boundaries.
- Verify Tailwind classes and styling integration.
- Verify Prisma/schema changes if applicable.
- Run build or typecheck after major changes.

---

## UI / Styling Rules

- Reuse the existing design system.
- Preserve current spacing and layout patterns.
- Avoid unnecessary visual redesigns.
- Verify responsive behavior.
- Verify dark mode compatibility if relevant.

---

## Next.js Rules

- Follow existing App Router patterns.
- Reuse current providers and layouts.
- Avoid breaking server/client boundaries.
- Keep server actions and database logic separated from UI components.

---

## Important

If unsure:
- analyze more first
- ask for clarification
- avoid guessing architecture

## Expense Tracker Architecture Rules (CRITICAL)

The project uses a strict 3-layer architecture:

### 1. lib/* (Database Layer - PURE)
- Only Prisma queries
- No validation
- No revalidatePath
- No UI logic
- No Prisma relation shapes exposed outside lib
- Accept simple primitives or flat objects only

Example:
- categoryId: string (NOT category: { connect })

---

### 2. app/actions/* (Server Actions Layer)
- Input validation ONLY
- Calls lib functions
- Handles try/catch
- Calls revalidatePath
- Returns { success, data?, error? }

STRICT RULE:
❌ Do NOT use Prisma directly here
❌ Do NOT use relation syntax like { connect }

---

### 3. components/* (UI Layer)
- No database logic
- Only calls actions

---

## Expense Domain Rule (VERY IMPORTANT)

For expenses:

❌ WRONG:
category: { connect: { id } }

✅ CORRECT:
categoryId: string

Lib layer is responsible for converting to Prisma schema shape.

---

## Refactor Rule

When modifying existing code:
- Preserve existing architecture pattern used in categories
- Align expenses to categories pattern
- Do NOT introduce new abstraction layers
- Do NOT mix Prisma logic into actions  

All lib/* inputs MUST use custom DTO interfaces.
Prisma generated input types are NOT allowed in lib layer.