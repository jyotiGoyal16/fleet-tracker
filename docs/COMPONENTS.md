# Component hierarchy and responsibilities

## Entry and shell

```
main.tsx
└── BrowserRouter
    └── App (from App.tsx)
```

- **`main.tsx`** — Renders the root into the DOM and wraps the app with `BrowserRouter` for client-side routing.

- **`App`** — Composes providers and `Routes`. Defines all URL → screen mappings.

- **`AppShell`** — Layout wrapper for routes under `/`:
  - **Admin routes** (`/admin`, `/admin/orders`, …): sidebar (nav + “Driver” link) + `<main>` with `<Outlet />`.
  - **Driver route** (`/driver`): full-width content, **no sidebar** (driver-focused layout).

- **`DriverNavItem`** — Sidebar link to `/driver` that opens in a **new tab** (with external-link affordance).

## Route → feature components

| Path | Component | Role |
|------|-----------|------|
| `/` | redirect → `/admin` | Default landing |
| `/admin` | `MasterData` | CRUD-style management of hubs, terminals, products, drivers, vehicles |
| `/admin/orders` | `Orders` | Order list, filters, create order, assign driver |
| `/admin/vehicles` | `Vehicles` | Vehicle–driver allocation by month |
| `/admin/fleet-map` | `FleetMap` | Map of vehicle locations with filters |
| `/admin/inventory` | `Inventory` | Per-location inventory table with search/type filters |
| `/driver` | `Driver` | Tab shell for the driver experience |

## Driver feature tree

```
Driver
├── Shifts        — Today’s shift, vehicle, start shift, assigned deliveries list
├── Deliveries    — Order actions (complete / fail), end shift, toasts
├── ShiftHistory  — Past shifts (read-only from sample data)
└── DriverMap     — Live map, route line, GPS demo button
```

`Driver` holds **local tab state** only (`useState`). It does not own global data; session data comes from `DriverSessionContext`.

## Admin feature components (flat under `features/admin/`)

Each file is a **page-level** component: it owns local UI state (modals, forms, filters) and reads/writes shared state via contexts or `sampleData` where noted.

- **`MasterData`** — Multi-tab master lists and dialogs for locations, products, drivers, vehicles.
- **`Orders`** — Uses `AdminOrdersContext` for the orders list; references `sampleData` for destinations and drivers.
- **`Vehicles`** — Allocation table and modal; local state for rows.
- **`FleetMap`** — Mapbox map, markers from sample locations, filters.
- **`Inventory`** — Table driven by hub/terminal data and product columns.

## Shared UI (`src/components/`)

| Component | Responsibility |
|-----------|----------------|
| `Button` | Primary actions, consistent variants |
| `Input` | Text/number inputs with optional error text |
| `Select` | Labeled dropdowns |
| `Modal` | Dialog shell (title, close, children) |
| `Loading` | Spinner + label; used while Mapbox map initializes |

These are **presentational building blocks**; business rules live in feature modules or `utils/`.

## Cross-cutting modules

- **`src/contexts/`** — `AdminOrdersProvider` / `DriverSessionProvider` (see [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)).
- **`src/data/sampleData.ts`** — Demo seed data (no backend in this project).
- **`src/types/`** — TypeScript models shared across features.
- **`src/constants.ts`** — Shared enums, tabs, refresh intervals.
- **`src/utils.ts`** — Small helpers (e.g. order status, inventory formatting).

## Data flow (high level)

- **Admin orders** — `Orders` ↔ `AdminOrdersContext` for list mutations; static reference data from `sampleData`.
- **Driver session** — `Shifts`, `Deliveries`, etc. ↔ `DriverSessionContext` for shift and session orders.
- **Maps** — `FleetMap` / `DriverMap` use Mapbox locally; `Loading` until `map.on('load')`.

This keeps **routes and folders aligned** (`features/admin` vs `features/driver`) and **shared UI** isolated under `components/`.
