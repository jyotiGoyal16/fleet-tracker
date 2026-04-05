# Technical decisions

Short rationale for major libraries and patterns used in this project.

## Build tool: Vite

- Fast dev server and HMR, simple config, first-class TypeScript support.
- Fits a SPA with no custom SSR requirements for this assignment.

## UI framework: React 19 + TypeScript

- Strong typing for domain models (`Order`, `DriverShift`, vehicles, hubs).
- Component model matches the assignment (admin vs driver surfaces).

## Styling: Tailwind CSS (v4 via Vite plugin)

- Utility-first styling keeps layout and spacing consistent without maintaining large CSS files.
- Dark mode uses `dark:` variants aligned with system preference where applicable.

## Routing: React Router (`react-router-dom`)

- Declarative routes for `/admin/*` and `/driver`.
- `Outlet` nests admin sub-routes under one parent; a single layout component (`AppShell`) switches between sidebar layout and full-width driver layout based on `pathname`.

## Maps: Mapbox GL JS (`mapbox-gl`)

- Industry-standard vector maps, good documentation, works with a public access token via `import.meta.env.VITE_MAPBOX_ACCESS_TOKEN`.
- Alternative considered: Leaflet — lighter, but Mapbox provides a polished default style and APIs used here (markers, bounds, GeoJSON line for routes).

## State: React Context + local state (no global store)

- **Scope:** Two bounded domains — admin order list and driver session — map cleanly to two small contexts.
- **Why not Redux / Zustand:** Extra boilerplate and learning surface for a demo-sized codebase; contexts are sufficient and keep dependencies minimal.
- **Rule:** Contexts do not cross-import; providers are siblings in the tree to avoid hidden coupling.

## Data: TypeScript modules (`sampleData`) instead of a REST API

- Keeps the assignment runnable offline and fast to iterate.
- Clear path to replace `sampleData` initialization with `fetch` inside providers or custom hooks later without rewriting UI structure.

## Component organization: `features/` + `components/`

- **`features/admin`** and **`features/driver`** — Route-aligned screens and domain logic.
- **`components`** — Reusable, low-level UI only.
- Avoids a single giant `pages/` folder mixed with atoms; scales by feature when the app grows.

## Driver opens in a new tab (sidebar link)

- Treats the driver UI as a separate “surface” (like a kiosk or phone) while admins stay in the console.
- Implemented with `target="_blank"` and `rel="noopener noreferrer"` on the sidebar link.

## Loading UX

- **Maps:** A shared `Loading` component shows until Mapbox fires `load`, because map initialization is genuinely asynchronous.
- **No global “app ready” gate:** Removed artificial timed loading so state management stays limited to the two contexts above.

## Linting: ESLint (React + TypeScript presets)

- Catches common React hooks mistakes and type issues; `npm run lint` runs in CI-friendly fashion alongside `npm run build`.
