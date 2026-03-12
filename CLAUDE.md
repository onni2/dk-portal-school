# DK Portal

Student graduation project portal built with React, TypeScript, and Vite.

## Quick Start

```bash
nvm use              # use pinned Node version (see .nvmrc)
npm install
npm run dev          # http://localhost:3000
```

When you open the project in VS Code you'll be prompted to install recommended extensions (ESLint, Prettier, Tailwind IntelliSense). Accept — this gives you autoformatting on save and Tailwind class autocomplete.

## Scripts

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start dev server on port 3000    |
| `npm run build`        | Type-check + production build    |
| `npm run preview`      | Preview production build         |
| `npm run lint`         | Run ESLint                       |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |

## Tech Stack

- **Build:** Vite + TypeScript
- **Routing:** TanStack Router (file-based, auto-generates `src/routeTree.gen.ts`)
- **Data fetching:** TanStack React Query
- **Client state:** Zustand
- **Styling:** Tailwind CSS v4
- **Linting:** ESLint + Prettier

## Project Structure

```
src/
  routes/                    # File-based routes (TanStack Router)
  features/                  # Feature modules (one folder per feature)
    <feature>/
      api/                   # Fetch functions + query hooks
      store/                 # Zustand stores for UI state
      components/            # Feature-specific components
      types/                 # TypeScript types for this feature
  shared/
    api/                     # Shared fetch client + types
    components/              # Shared UI components (Layout, spinners, etc.)
    utils/                   # Utility functions (cn, etc.)
  mocks/                     # Mock data + helpers
  App.tsx                    # QueryClient + Router providers
  main.tsx                   # Entry point
```

### Naming convention: routes vs features

Both route folders and feature folders use **English** names:

- `routes/invoices/`, `routes/employees/`, `routes/timeclock/`, `routes/customers/`
- `features/invoices/`, `features/employees/`, `features/timeclock/`, `features/customers/`

This keeps everything consistent and easier to navigate.

## How to Add a New Feature

Use the `projects` feature as a reference. Copy its structure for your new feature.

### 1. Define types

Create `src/features/<name>/types/<name>.types.ts`:

```ts
export interface Task {
  id: string;
  title: string;
  done: boolean;
}
```

### 2. Create API functions

Create `src/features/<name>/api/<name>.api.ts`:

```ts
import { delay } from "@/mocks/handlers";
import { MOCK_TASKS } from "@/mocks/tasks.mock";
import type { Task } from "../types/tasks.types";

// Replace with apiClient.get<Task[]>("/tasks") when backend is ready
export async function fetchTasks(): Promise<Task[]> {
  await delay(400);
  return MOCK_TASKS;
}
```

### 3. Create query hooks

Create `src/features/<name>/api/<name>.queries.ts`:

```ts
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchTasks } from "./tasks.api";

export const tasksQueryOptions = queryOptions({
  queryKey: ["tasks"],
  queryFn: fetchTasks,
});

export function useTasks() {
  return useSuspenseQuery(tasksQueryOptions);
}
```

### 4. Create a Zustand store (if you need UI state)

Create `src/features/<name>/store/<name>.store.ts`:

```ts
import { create } from "zustand";

interface TaskFiltersState {
  search: string;
  setSearch: (search: string) => void;
}

export const useTaskFilters = create<TaskFiltersState>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
}));
```

Zustand is for **UI-only state** (filters, toggles, modals). Server data lives in React Query.

### 5. Create components

Create `src/features/<name>/components/TaskList.tsx` (and others):

```tsx
import { useTasks } from "../api/tasks.queries";

export function TaskList() {
  const { data: tasks } = useTasks();
  return (
    <ul>
      {tasks.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

### 6. Create a route

Create `src/routes/tasks/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { tasksQueryOptions } from "@/features/tasks/api/tasks.queries";
import { TaskList } from "@/features/tasks/components/TaskList";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/tasks/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(tasksQueryOptions),
  component: TasksPage,
});

function TasksPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TaskList />
    </Suspense>
  );
}
```

The route file is automatically picked up — no manual registration needed. Add a nav link in `src/shared/components/Layout.tsx`.

### 7. Add mock data

Create `src/mocks/tasks.mock.ts` with an array of your type. When the backend is ready, swap `delay()` + mock array for `apiClient.get()` in your `.api.ts` file.

## Key Patterns

### Data fetching: queryOptions + loaders

Define `queryOptions` once, then share them:

- **Route loader** calls `queryClient.ensureQueryData(options)` to prefetch on navigation
- **Component** calls `useSuspenseQuery(options)` to read the cached data

This means data starts loading _before_ the component mounts.

### Server state vs client state

| What                       | Where             | Tool               |
| -------------------------- | ----------------- | ------------------ |
| Data from the API          | React Query cache | `useSuspenseQuery` |
| UI state (filters, modals) | Zustand store     | `create()`         |

Never duplicate API data into Zustand. Use React Query for anything fetched from a server.

### Styling with cn()

Use the `cn()` helper from `@/shared/utils/cn` for conditional classes:

```tsx
import { cn } from "@/shared/utils/cn";

<div className={cn("base-classes", isActive && "active-classes")} />;
```

### Path alias

`@/*` maps to `src/*`. Always use it for imports:

```ts
import { Layout } from "@/shared/components/Layout";
```

### Error handling

The root route has built-in error and 404 handling:

- **404:** Navigating to an unknown URL shows a friendly "not found" page (`src/shared/components/NotFound.tsx`)
- **Errors:** If a route loader or component throws, a fallback error page renders with a "Try again" button (`src/shared/components/RouteError.tsx`)

These are set on `__root.tsx` via `notFoundComponent` and `errorComponent`, so they apply to every route automatically.

### Connecting to a real API

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`
2. In your `.api.ts` file, replace the mock body with `apiClient` calls:

```ts
import { apiClient } from "@/shared/api/client";

export async function fetchTasks(): Promise<Task[]> {
  return apiClient.get<Task[]>("/tasks");
}
```

## Files You Should Not Edit

- `src/routeTree.gen.ts` — auto-generated by TanStack Router plugin. It regenerates when you add/remove route files.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must match this format:

```
<type>(<scope>): <short description>
```

### Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or functionality                            |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, missing semicolons (no code changes)        |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Build config, dependencies, CI, tooling                 |

### Scope

Use the feature or area name: `projects`, `auth`, `layout`, `router`, `api`, etc. Scope is optional but encouraged.

### Rules

- Subject line: lowercase, imperative mood, no period, max 72 characters
- Body (optional): explain _why_, not _what_. Separate from subject with a blank line
- Breaking changes: add `!` after the type/scope, e.g. `feat(api)!: change response format`

### Examples

```
feat(projects): add project search filter
fix(router): handle missing projectId param
docs: update CLAUDE.md with commit conventions
refactor(projects): extract status badge into component
chore: upgrade tanstack query to v5.91
```

## Docker

This project doesn't include a Dockerfile yet — that's for you to set up. Here's what to consider:

### The build

This is a static site. `npm run build` outputs everything to `dist/` — just HTML, CSS, and JS. No Node server needed at runtime.

### Approach

Use a **multi-stage build**:

1. **Build stage** — use a Node image, install deps, run `npm run build`
2. **Serve stage** — use a lightweight web server image (e.g. `nginx:alpine`), copy `dist/` into it

This keeps the final image small since it only contains the static files and the web server — no `node_modules`.

### Things to handle

- **Environment variables:** Vite bakes `VITE_*` env vars into the bundle at build time (not runtime). If you need different values per environment, look into generating a runtime config file or using build args (`ARG` / `--build-arg`)
- **Routing:** TanStack Router uses client-side routing, so all paths need to serve `index.html`. In nginx, add `try_files $uri $uri/ /index.html` to your config
- **`.dockerignore`:** Create one. At minimum, exclude `node_modules`, `dist`, and `.git` so they don't bloat the build context

### Verifying it works

```bash
docker build -t dk-portal .
docker run -p 8080:80 dk-portal
# visit http://localhost:8080, click around, refresh on /projects — should all work
```

The refresh test on `/projects` is important — it confirms your nginx config handles client-side routing correctly.

## Testing

This project requires tests. No testing framework is included yet — choosing and setting one up is part of the work.

### What to consider

- **Unit tests:** Pure functions, Zustand stores, data transformations. These are fast and easy to write.
- **Component tests:** Render a component, assert it shows the right content, simulate user interaction. Needs a way to render React components in a test environment.
- **Integration / E2E tests:** Full user flows — navigate to a page, fill in filters, click through to a detail view. Runs against the actual app in a browser.

You don't need all three from day one. Start with unit and component tests, add E2E later if time allows.

### Common choices in the React ecosystem

| Category          | Popular options       |
| ----------------- | --------------------- |
| Test runner       | Vitest, Jest          |
| Component testing | React Testing Library |
| E2E               | Playwright, Cypress   |

Vitest is the natural fit here since the project already uses Vite — it shares the same config and transforms.

### What to test

At minimum, every feature should have tests for:

- API functions return the expected shape
- Query hooks provide data to components correctly
- Components render based on props/state (e.g. filters actually filter the list)
- Route navigation works (clicking a project card goes to the detail page)

### Adding a test script

Once you've chosen a framework, add a `test` script to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

## Code Quality

Run before committing:

```bash
npm run lint && npm run format:check
```

Or auto-fix everything:

```bash
npm run format && npm run lint
```
