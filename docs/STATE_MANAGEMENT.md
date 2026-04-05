# Application state management

## Summary

State is handled with **React built-ins** only:

- **`useState` / `useMemo`** in feature components for UI-local state (tabs, modals, form fields, filters).
- **Two separate React contexts** for data that must be shared across multiple components or routes.
- **No** Redux, Zustand, Jotai, or React Query — the app uses in-memory **sample data** and does not call a remote API in this assignment build.

The two contexts are **independent**: they do not import each other. Nesting in `App.tsx` is only to satisfy React’s provider tree.

---

## 1. Admin orders — `AdminOrdersContext`

**Purpose:** Share the mutable **order list** between the admin Orders screen and any other consumer that needs the same list (currently primarily `Orders`).

**API:**

- `orders` — `Order[]`
- `setOrders` — React `Dispatch<SetStateAction<Order[]>>`

**Initialization:** Orders are seeded from `sampleData.orders` when the provider mounts.

**Who uses it:** `Orders` (and any future admin component that must read/write the same list).

---

## 2. Driver session — `DriverSessionContext`

**Purpose:** Share **today’s driver shift**, **orders tied to that session**, and the demo **vehicle allocation** for the driver flows.

**API:**

- `shift` / `setShift` — Current `DriverShift | null`
- `sessionOrders` / `setSessionOrders` — Orders shown in driver deliveries
- `allocation` — Read-only demo allocation from sample data (`VehicleAllocation | undefined`)

**Initialization:** From exported slices in `sampleData` (`driverDemoShift`, `driverDemoOrders`, `driverDemoAllocation`).

**Who uses it:** `Shifts`, `Deliveries`, and related driver UI that must stay in sync when the user starts a shift or completes deliveries.

---

## 3. Everything else

| Kind of state | Where it lives |
|---------------|----------------|
| Master data lists (hubs, products, drivers, vehicles in UI) | Local `useState` in `MasterData`, initialized from `sampleData` |
| Vehicle allocation rows | Local `useState` in `Vehicles` |
| Map filters, map instance | Local state + refs in `FleetMap` / `DriverMap` |
| Inventory search/filter | Local state in `Inventory` |
| Active tab in driver app | Local `useState` in `Driver` |
| Static catalog lookups | Imported `sampleData` or `constants` where needed |

---

## 4. Persistence and backend

There is **no persistence layer** in this repo: refresh resets to sample data except what React state held before reload. A production app would replace sample initialization with API calls and optionally persist drafts; the same context boundaries would still separate **admin orders** from **driver session** concerns.
