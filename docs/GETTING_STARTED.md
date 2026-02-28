# Getting Started — For Everyone

## Step 1: Clone the project

```bash
git clone <repo-url>
cd dk-portal
```

## Step 2: Install Node

We use Node 23. If you have `nvm` installed:

```bash
nvm install 23
nvm use
```

If you don't have nvm: https://github.com/nvm-sh/nvm#installing-and-updating

Check it worked:

```bash
node --version
# should show v23.x.x
```

## Step 3: Install dependencies

```bash
npm install
```

## Step 4: Set up your environment file

Copy the example file:

```bash
cp .env.example .env
```

Then open `.env` and replace `your-bearer-token-here` with the real API token (ask Onni for it). It should look like:

```
VITE_API_BASE_URL=https://api.dkplus.is/api/v1
VITE_API_TOKEN=the-actual-token-here
VITE_APP_ENV=development
```

**Important:** Never commit `.env` to git. It's already in `.gitignore`.

## Step 5: Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the portal with a sidebar.

---

## Quick reference — commands you'll use every day

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start the app (http://localhost:3000)     |
| `npm test`           | Run all tests                             |
| `npm run test:watch` | Run tests and re-run when you save a file |
| `npm run lint`       | Check code for problems                   |
| `npm run format`     | Auto-fix formatting                       |

**Before every commit**, run:

```bash
npm run format && npm run lint
```

---

## What should I work on?

### Design team (Ágústa, Þóra)

Your files live in:

- `src/index.css` — theme variables (colors, fonts, spacing from Figma)
- `src/shared/components/` — shared UI components (buttons, cards, badges, inputs)

**First task:** Open `src/index.css` and fill in the CSS variables from the Figma design. Every color, font, and size should come from here — not hardcoded in components.

When building a component:

1. Create the file in `src/shared/components/YourComponent.tsx`
2. Use CSS variables from the theme: `text-[var(--color-primary)]`
3. Accept data through props — don't fetch data in shared components
4. Export with a named export: `export function YourComponent() {}`

### Feature team (Jón, Ísak)

Your files live in:

- `src/features/<feature-name>/` — one folder per feature
- `src/routes/` — route files (pages)
- `src/mocks/` — mock data

**First task:** Build the **Notendur** (employees/users) feature. Follow the `projects` feature as a template. The API endpoint is `/general/employee`.

Steps for every new feature:

1. Create folder: `src/features/<name>/`
2. Add types: `src/features/<name>/types/<name>.types.ts`
3. Add API function: `src/features/<name>/api/<name>.api.ts`
4. Add query hook: `src/features/<name>/api/<name>.queries.ts`
5. Add components: `src/features/<name>/components/`
6. Add route: `src/routes/<name>/index.tsx`
7. Add tests in `__tests__/` folders

See `CLAUDE.md` for the full guide with code examples.

---

## Project structure — where things are

```
src/
  features/           ← Feature team works here
    projects/          ← Example feature to copy from
  routes/              ← Feature team works here (pages)
  shared/
    components/        ← Design team works here
    api/               ← API client (already set up)
    utils/             ← Shared helpers
  mocks/               ← Mock data
  index.css            ← Design team: theme variables
  test/                ← Test setup (don't touch)
docs/
  TESTING.md           ← How to write tests
  DOCKER.md            ← How to build/run with Docker
Dockerfile             ← Docker setup (don't touch)
CLAUDE.md              ← Full development guide
```

---

## Asking for help

- **Code question:** Ask Onni
- **Design question:** Ask Ágústa
- **API question:** Check the docs at https://api.dkplus.is/swagger/ui/index
- **Something broken:** Run `npm run lint` and `npm test` first — they usually explain the problem
