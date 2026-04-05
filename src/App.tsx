import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AdminOrdersProvider } from './contexts/AdminOrdersContext';
import { DriverSessionProvider } from './contexts/DriverSessionContext';
import FleetMap from './features/admin/FleetMap';
import Inventory from './features/admin/Inventory';
import MasterData from './features/admin/MasterData';
import Orders from './features/admin/Orders';
import Vehicles from './features/admin/Vehicles';
import Driver from './features/driver/Driver';

const ADMIN_NAV_ITEMS = [
  { to: '/admin', label: 'Master data' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/vehicles', label: 'Vehicles' },
  { to: '/admin/fleet-map', label: 'Fleet map' },
  { to: '/admin/inventory', label: 'Inventory' },
] as const;

function DriverNavItem() {
  const { pathname } = useLocation();
  const isDriverActive = pathname === '/driver';

  return (
    <Link
      to="/driver"
      target="_blank"
      rel="noopener noreferrer"
      title="Open driver app in a new tab"
      className={`flex justify-between items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
        isDriverActive
          ? 'bg-violet-600 font-medium text-white'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <span>Driver</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 shrink-0"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M15.75 2.25H21a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0V4.81L8.03 17.03a.75.75 0 01-1.06-1.06L19.19 3.75h-3.44a.75.75 0 010-1.5zm-10.5 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 00.75.75h10.5a.75.75 0 00.75-.75v-4.5a.75.75 0 011.5 0v4.5a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V8.25a2.25 2.25 0 012.25-2.25h4.5a.75.75 0 010 1.5H5.25z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isDriverRoute = pathname === '/driver';

  if (isDriverRoute) {
    return (
      <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-slate-50 md:flex-row dark:bg-slate-950">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:w-56 md:border-r md:border-b-0">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">Fleet Tracker</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {ADMIN_NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-violet-600 font-medium text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <DriverNavItem />
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AdminOrdersProvider>
      <DriverSessionProvider>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/admin" replace />} />
            <Route path="admin" element={<Outlet />}>
              <Route index element={<MasterData />} />
              <Route path="orders" element={<Orders />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="fleet-map" element={<FleetMap />} />
              <Route path="inventory" element={<Inventory />} />
            </Route>
            <Route path="driver" element={<Driver />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </DriverSessionProvider>
    </AdminOrdersProvider>
  );
}

export default App;
