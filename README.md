# Bob's Adventures

A personal travel journal and companion app for Bob's 5th wheel RV adventures across the United States. Bob spends winters at his home base in Arizona and travels the country each spring through fall.

## Features

- **Travel Journal** — Write and browse journal entries with mood tracking and location tagging
- **Photo Gallery** — Organize photos by location and journal entry
- **Location Tracker** — Log every destination with arrival/departure dates and miles from home
- **Campground Notes** — Rate and review RV parks with hookup details, nightly price, and return rating
- **Travel Dashboard** — Live stats: locations visited, miles traveled, states explored, and more
- **Recent Entries Feed** — Quick view of the latest adventure entries

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express 5 (Node.js) + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **API**: OpenAPI spec with Orval codegen (React Query hooks + Zod validation)
- **Monorepo**: pnpm workspaces

## Project Structure

```
├── artifacts/
│   ├── bobs-adventures/    # React + Vite frontend (serves at /)
│   └── api-server/         # Express API server (serves at /api)
├── lib/
│   ├── api-spec/           # OpenAPI spec + codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod validation schemas
│   └── db/                 # Drizzle ORM schema + database client
└── scripts/                # Utility scripts
```

## Getting Started

### Prerequisites
- Node.js 24+
- pnpm
- PostgreSQL database (set `DATABASE_URL` env var)

### Install dependencies
```bash
pnpm install
```

### Run the API server
```bash
pnpm --filter @workspace/api-server run dev
```

### Run the frontend
```bash
pnpm --filter @workspace/bobs-adventures run dev
```

### Database migrations
```bash
pnpm --filter @workspace/db run push
```

### Regenerate API types (after spec changes)
```bash
pnpm --filter @workspace/api-spec run codegen
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/journal` | List / create journal entries |
| GET/PATCH/DELETE | `/api/journal/:id` | Single entry operations |
| GET/POST | `/api/photos` | List / add photos |
| DELETE | `/api/photos/:id` | Delete a photo |
| GET/POST | `/api/locations` | List / add locations |
| GET/PATCH/DELETE | `/api/locations/:id` | Single location operations |
| GET/POST | `/api/campgrounds` | List / add campground notes |
| PATCH/DELETE | `/api/campgrounds/:id` | Update / delete campground |
| GET | `/api/stats/summary` | Travel statistics summary |
| GET | `/api/stats/recent-entries` | Recent journal entries feed |

## Git Workflow

This project is hosted at **https://github.com/DVass81/bobs-adventures**.

To sync the full codebase with the GitHub repository, use Replit's built-in Git panel (the branch/git icon in the left sidebar). From there you can:

- **Push** your latest changes to `origin/main` on GitHub
- **Pull** to fetch changes made directly on GitHub
- **View** commit history and diffs

When working locally after cloning:
```bash
git clone https://github.com/DVass81/bobs-adventures.git
cd bobs-adventures
pnpm install
# Set DATABASE_URL in your .env, then:
pnpm --filter @workspace/db run push   # apply schema
pnpm --filter @workspace/api-server run dev   # start API
pnpm --filter @workspace/bobs-adventures run dev  # start frontend
```
