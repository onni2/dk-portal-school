# How We Write Comments

This guide keeps our comment style consistent across the project.

## File Header

Every `.ts` and `.tsx` file gets a header block at the very top, before imports:

```ts
/**
 * One-line description of what this file does.
 * Uses: @/path/to/dep, other/dep
 * Exports: ExportedName
 */
```

Keep it short — one sentence is enough. The `Uses` line lists the main imports. The `Exports` line lists what other files will import from here.

## Exported Functions and Components

Every exported function, component, or hook gets a one-line JSDoc above it:

```ts
/** Renders the invoice list with sorting and pagination. */
export function TransactionTable() { ... }

/** Fetches all tickets for the given department. */
export async function fetchTickets(departmentId?: string) { ... }
```

If the export is complex enough to need more explanation, use a multi-line block:

```ts
/**
 * Derives the user's permissions from their company membership.
 * Falls back to all-false if the company is not found in the list.
 */
function derivePermissions(...) { ... }
```

## Inline Comments

Only add an inline comment when the **why** is non-obvious. Ask yourself: would a teammate be confused by this line in 3 months?

**Good — explains a non-obvious decision:**
```ts
// Clamp page so stale page state never produces an empty view after filters change
const currentPage = Math.min(page, totalPages);
```

**Bad — just restates the code:**
```ts
// Set loading to true
setLoading(true);
```

## What NOT to Comment

- Don't comment every line
- Don't restate what the code already says clearly
- Don't add comments on simple `const` variables
- Don't add comments on type properties inside interfaces — only on the interface itself

## Interfaces and Types

```ts
/** Shape of a portal user returned from the users API. */
export interface PortalUser {
  id: string;
  name: string;
  email: string;
}
```

One line above the type declaration is enough. No need to comment individual fields unless a field name is genuinely confusing.

## Summary

| Where | Comment? |
|---|---|
| Top of every file | Always — file header block |
| Exported functions/components/hooks | Always — one-line JSDoc |
| Private helper functions | Only if logic is non-obvious |
| Inline code | Only when WHY is unclear |
| Interface/type declarations | Always — one-line JSDoc |
| Interface fields | Only if name is confusing |
