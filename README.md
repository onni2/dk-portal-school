# DK Portal

Student graduation project portal — browse projects, filter by status, and view details.

## Getting Started

```bash
nvm use                # use pinned Node version
npm install            # install dependencies
npm run dev            # start dev server at http://localhost:3000
```

## Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start dev server on port 3000    |
| `npm run build`        | Type-check + production build    |
| `npm run preview`      | Preview the production build     |
| `npm run lint`         | Run ESLint                       |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — build tool
- [TanStack Router](https://tanstack.com/router) — file-based routing
- [TanStack Query](https://tanstack.com/query) — server state / data fetching
- [Zustand](https://zustand.docs.pmnd.rs/) — client state
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) — linting and formatting

## Project Structure

```
src/
  routes/              # File-based routes (auto-registered)
  features/            # Feature modules (types, API, queries, store, components)
  shared/              # Shared utilities, components, and API client
  mocks/               # Mock data and helpers
```

Each feature follows the same structure. See `src/features/projects/` for the reference implementation.

## Documentation

Read **[CLAUDE.md](./CLAUDE.md)** for full development instructions including:

- How to add a new feature (step-by-step)
- Key patterns (data fetching, routing, state management, styling)
- Commit message conventions
- Docker deployment guidance
- Testing requirements
