# DK Portal — Mock Backend API

Express + PostgreSQL (Neon) backend that simulates the DK API for local development.

## Quick Start

```bash
cd server
cp .env.example .env   # fill in your values (see below)
npm install
npm run dev            # starts on http://localhost:3001
```

Or from the project root:

```bash
npm run api:dev
```

## Environment Variables

Create `server/.env` — **never commit this file**.

```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=any-long-random-string
PORT=3001
DK_TOKEN=shared-dk-plus-api-token
```

- **DATABASE_URL** — get this from [neon.tech](https://neon.tech) → your project → Connection string. Everyone on the team uses the same database, so share this privately (Discord/Teams).
- **JWT_SECRET** — can be anything, just keep it the same across the team.
- **DK_TOKEN** — the shared DK Plus API token for company HR. Ask Óðinn.

## Database

Uses a shared Neon PostgreSQL database. On first startup, the server:

1. Runs **migrations** — creates any new tables/columns that don't exist yet (safe to run repeatedly)
2. Runs **seed** — inserts initial data only if the database is empty

Tables:

| Table | Description |
|-------|-------------|
| `companies` | Companies (HR), holds the shared `dk_token` |
| `portal_users` | Portal user accounts with roles and credentials |
| `user_permissions` | Per-user module access flags |
| `hosting_accounts` | Company hosting accounts for the invite modal |
| `timeclock_ip_whitelist` | IP whitelist per company |
| `timeclock_employee_phones` | Employee phone numbers per company |

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login with username + password, returns JWT |
| POST | `/auth/audkenni` | Login via Auðkenni (electronic ID), matches by kennitala |

### Users *(requires admin JWT)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List all users in the company |
| POST | `/users/invite` | Invite a new user (inherits admin's company) |
| PATCH | `/users/:id` | Update own kennitala or phone |
| DELETE | `/users/:id` | Remove a user |
| POST | `/users/:id/reset-password` | Change password |
| GET | `/users/:id/permissions` | Get user's module permissions |
| PUT | `/users/:id/permissions` | Update user's module permissions |

### Hosting
| Method | Path | Description |
|--------|------|-------------|
| GET | `/hosting/accounts` | List hosting accounts for the company |

### Timeclock
| Method | Path | Description |
|--------|------|-------------|
| GET | `/timeclock/ips` | List IP whitelist |
| POST | `/timeclock/ips` | Add IP entry |
| DELETE | `/timeclock/ips/:id` | Remove IP entry |
| GET | `/timeclock/phones` | List employee phones |
| POST | `/timeclock/phones` | Add employee phone |
| DELETE | `/timeclock/phones/:id` | Remove employee phone |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |

## Team Logins

| Username | Password | Notes |
|----------|----------|-------|
| `odinn` | `admin123` | |
| `jon` | `admin321` | |
| `agusta` | `Agusta1!` | must set new password on first login |
| `thora` | (set by user) | |
| `isak` | (set by user) | |

## Switching to a New Neon Database

If you need to migrate to a new Neon project:

```bash
# Dump old DB
pg_dump "old-connection-string" > backup.sql

# Restore to new DB
psql "new-connection-string" < backup.sql
```

Then update `DATABASE_URL` in `server/.env` and restart.
