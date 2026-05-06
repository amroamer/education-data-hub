# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

Frontend prototype for an **Education Data Hub** — a regulator/institution
data submission and marketplace platform (KHDA / Dubai private schools as
the demo domain). Single-page React app, no backend; all data is mocked
inline in page files.

Built with Vite + React + shadcn/ui.

## Stack

- **Vite 5** + **React 18** + **TypeScript** (SWC plugin)
- **Tailwind 3** + **shadcn/ui** (full component set in `src/components/ui/`)
- **react-router-dom** v6 for routing
- **TanStack Query** v5 for server state (currently unused — no backend)
- **react-hook-form** + **zod** for forms
- **recharts** for charts
- **Vitest** + Testing Library for unit tests; **Playwright** for e2e
- Path alias: `@/` → `src/`

## Commands

Use **Bun** as the package manager — `bun.lock` and `bun.lockb` are committed.
A `package-lock.json` is also present; prefer `bun`.

```bash
bun install           # install deps
bun dev               # dev server on http://localhost:8080
bun run build         # production build → dist/
bun run build:dev     # dev-mode build
bun run lint          # eslint
bun test              # vitest run
bun run test:watch    # vitest watch
bunx playwright test  # e2e
```

The Vite dev server binds to port **8080** (not the default 5173) — see
`vite.config.ts`.

## Architecture

### Routing — `src/App.tsx`
All routes nest under one `AppLayout` (sidebar + topbar shell):

| Path            | Page                              |
|-----------------|-----------------------------------|
| `/`             | `pages/Dashboard.tsx`             |
| `/marketplace`  | `pages/DataMarketplace.tsx`       |
| `/upload`       | `pages/UploadPortal.tsx`          |
| `/connectors`   | `pages/APIConnectors.tsx`         |
| `/institutions` | `pages/Institutions.tsx`          |
| `*`             | `pages/NotFound.tsx`              |

`pages/Index.tsx` exists but is unrouted — likely dead code.

### Role system — `src/contexts/RoleContext.tsx`
The app has two demo personas, switchable via `useRole()`:

- **`regulator`** — KHDA inspector ("Fatima Al-Marri")
- **`institution`** — School admin ("James Patterson", GEMS Wellington)

`Dashboard.tsx` branches on `isRegulator` to render `RegulatorDashboard`
vs `InstitutionDashboard`. When adding role-aware UI elsewhere, follow
the same pattern: read `useRole()`, branch in render.

The role is purely client-side state with no auth — switching is just
`setRole()`. No tokens, no backend check.

### Upload portal state machine — `src/pages/upload/`
`UploadPortal.tsx` drives a 5-stage flow via a `Stage` union type:

```
select → upload → mapping → validating → results
```

Each stage has its own component (`StageSelect`, `StageUpload`, etc.)
and `StageProgress` renders the stepper. Shared types live in `types.ts`,
mock templates/data in `data.ts`. Stage transitions happen via callbacks
passed from `UploadPortal`, not via router params.

When extending the flow, keep the convention: stages are pure components
that call `onNext`-style callbacks; `UploadPortal` owns all state.

## Conventions

- **shadcn/ui aliases** (see `components.json`): components go in
  `@/components/ui`, utils in `@/lib/utils`, hooks in `@/hooks`.
  Use `npx shadcn@latest add <component>` to add new primitives.
- **Status badges** use semantic classes from `src/index.css`:
  `badge-success`, `badge-warning`, `badge-error`, `badge-pending`.
  Stat cards use `.stat-card`. Don't hand-roll equivalents.
- **Color tokens** are HSL strings consumed via inline `style={{ ... }}`
  in many places (e.g. `Dashboard.tsx`). The Tailwind theme + CSS
  custom properties are defined in `tailwind.config.ts` and `index.css`.
- **All page data is mocked inline** at the top of each page file. There
  is no API layer yet. If you wire a real backend, introduce it through
  TanStack Query (already installed and provider mounted in `App.tsx`).

## Gotchas

- **Two lockfiles** (`bun.lock` + `package-lock.json`) — don't commit
  changes to both. Prefer Bun.
- **`hmr.overlay: false`** is set in `vite.config.ts` — HMR errors won't
  show as a browser overlay. Watch the terminal/console.
- **`SidebarProvider defaultOpen={false}`** in `AppLayout.tsx` — the
  sidebar is collapsed by default.
- **Not all dependencies are used yet** — `react-hook-form`, `zod`,
  `TanStack Query`, `embla-carousel`, etc. are installed but the
  prototype doesn't exercise them.

## Testing notes

- Vitest config (`vitest.config.ts`) uses jsdom and includes
  `src/**/*.{test,spec}.{ts,tsx}`. Setup file is `src/test/setup.ts`.
- The only existing test is `src/test/example.test.ts` (placeholder).
- Playwright config is in `playwright.config.ts` with `baseURL` set to
  `http://localhost:8080/khdaDataHub`.

## What's likely next

The prototype is UI-complete but has no persistence. Probable directions:
backend integration (Supabase or custom API), real auth replacing the
mock role context, and replacing inline mock data with TanStack Query
hooks. Confirm direction with the user before introducing one.
