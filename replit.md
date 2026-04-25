# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains "Bob's Adventures" — a personal travel journal and companion app for a retired RV traveler.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **Bob's Adventures** (`artifacts/bobs-adventures`) — React + Vite web app at `/`
- **API Server** (`artifacts/api-server`) — Express 5 API at `/api`

## Features

- Travel Journal — write and browse journal entries with mood tracking
- Photo Gallery — organize photos by location and journal entry
- Location Tracker — log all travel destinations with dates and mileage
- Campground Notes — rate and review campgrounds with hookup details
- Travel Dashboard — stats overview (locations, miles, states, entries)
- Recent Entries Feed — quick view of latest journal activity

## Database Schema

Tables: `locations`, `journal_entries`, `photos`, `campgrounds`

## API Endpoints

- `GET/POST /api/journal` — list/create journal entries
- `GET/PATCH/DELETE /api/journal/:id` — single entry ops
- `GET/POST /api/photos` — list/create photos
- `DELETE /api/photos/:id` — delete photo
- `GET/POST /api/locations` — list/create locations
- `GET/PATCH/DELETE /api/locations/:id` — single location ops
- `GET/POST /api/campgrounds` — list/create campgrounds
- `PATCH/DELETE /api/campgrounds/:id` — update/delete campground
- `GET /api/stats/summary` — travel statistics
- `GET /api/stats/recent-entries` — recent journal entries with location info

## GitHub Repository

- **URL**: https://github.com/DVass81/bobs-adventures
- **Account**: DVass81
- Connected via Replit GitHub integration

To sync code to GitHub, use Replit's built-in Git panel (the git icon in the sidebar). The repository was created and the README committed on 2026-04-25.

## Notes

- `lib/api-zod/src/index.ts` only exports from `./generated/api` (not `./generated/types`) to avoid duplicate export conflicts caused by Orval's split mode generation.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
