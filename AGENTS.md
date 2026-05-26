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