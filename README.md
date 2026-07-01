# RadarDesk

RadarDesk is a JavaScript/TypeScript learning project that will grow into a web dashboard lab.

The long-term goal is to practice:

- JavaScript and TypeScript basics
- React + TypeScript frontend development
- Forms, tables, cards, dashboards, and maps
- API integration
- Backend deployment
- PostgreSQL with Neon
- Free-tier deployment with Firebase/Vercel + Render + Neon

## Current Scripts

```bash
npm run dev
npm run build
npm test
npm run test:coverage
npm run server:dev
npm run server:typecheck
npm run hello
```

On Windows PowerShell, if `npm.ps1` is blocked by execution policy, use:

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd test
npm.cmd run test:coverage
npm.cmd run server:dev
npm.cmd run server:typecheck
npm.cmd run hello
```

## UI-First MVP

The first RadarDesk screen is a React + TypeScript dashboard powered by mock data:

- Summary cards
- Device status list
- Device search and status filtering
- Alert list
- Alert severity filtering
- Project intake form shell
- Lazy-loaded Leaflet operation map with mock markers, range rings, and alert overlays

## Mock API

The first backend slice is a Node.js + TypeScript + Express API that still uses safe mock data:

- `GET /health`
- `GET /api/devices`
- `GET /api/alerts`
- `GET /api/projects`
- `POST /api/projects`

Run it locally with:

```bash
npm run server:dev
```

The default API URL is `http://localhost:4000`. Render health checks should use `/health`.

## Current Verification

Last verified commands:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run server:typecheck
```

Current result: 10 test files and 39 tests pass, frontend build passes, and server typecheck passes.
Coverage summary: 98.42% statements, 95.08% branches, 95.83% functions, and 98.34% lines.

## Remaining Work

- Choose and document the frontend hosting target.
- Plan Render backend deployment settings and production CORS.
- Design the first Neon Postgres schema and migration flow.
- Add auth and role enforcement beyond the current mock admin/operator/viewer data.
- Keep refining documentation as backend and database decisions become real.

## Environment Variables

Use `.env.example` as the safe template. Backend secrets belong only in backend/runtime environment variables. `VITE_` values are public because Vite exposes them in the frontend bundle.

## Project Guides

- `AGENTS.md`: AI agent rules for this repo.
- `CLAUD.md`: Claude-style coding assistant rules.
- `docs/project-brief.md`: project goals and scope.
- `docs/ai-guides/`: frontend, security, architecture, deployment, and quality guides.

## Sensitive Files

Local PDFs and local work notes are intentionally ignored by git:

- `docs/pdfler/`
- `docs/yeni-is-pdf-ozeti.md`

Do not push sensitive customer, project, RF/radar, defense, or internal work documents unless explicitly approved.

## Mock Data Policy

RadarDesk uses mock/demo records only. Do not add real customer names, real site coordinates, PDF-derived requirements, RF/radar performance details, or internal project notes to code, tests, mock data, seed data, screenshots, or deploy packages.

## Researched Next Steps

The current UI-first MVP is in place. The next practical improvements are:

- Connect the frontend to the local Express API through `VITE_API_BASE_URL` during development.
- Plan Neon Postgres tables for projects, devices, alerts, and users.
- Add auth and backend role checks before treating UI roles as permissions.
- Prepare Render/Firebase or Render/Vercel deploy settings with production CORS.
