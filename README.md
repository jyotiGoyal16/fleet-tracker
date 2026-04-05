# Fleet Tracker

Admin console and driver app for managing fleet operations: master data, orders, vehicle allocation, live fleet map, inventory, and a separate driver UI for shifts and deliveries.

## Requirements

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node)

## Setup

1. **Clone the repository** and open the project directory.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**

   Maps use Mapbox. Create a `.env` file in the project root (same level as `package.json`):

   ```bash
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token
   ```

   Get a token from [Mapbox account tokens](https://account.mapbox.com/access-tokens/). Without this variable, fleet and driver map pages show a message instead of the map; the rest of the app still runs.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open the URL printed in the terminal (usually `http://localhost:5173`).

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Start Vite dev server with HMR       |
| `npm run build`| Typecheck and production build       |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint                           |

## Project layout

- `src/App.tsx` — Routing, shell layout, context providers
- `src/features/admin/` — Admin screens (master data, orders, vehicles, maps, inventory)
- `src/features/driver/` — Driver app (tabs: shifts, deliveries, history, live map)
- `src/components/` — Shared UI primitives
- `src/contexts/` — React contexts for shared state
- `docs/` — Architecture and design notes (see below)

## Documentation

- [`docs/COMPONENTS.md`](docs/COMPONENTS.md) — Component hierarchy and responsibilities
- [`docs/STATE_MANAGEMENT.md`](docs/STATE_MANAGEMENT.md) — Application state
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — Technical choices and rationale

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, React Router, Mapbox GL JS. Dependencies are listed in [`package.json`](package.json).
