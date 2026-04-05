import { useMemo } from 'react';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import { useDriverSession } from '../../contexts/DriverSessionContext';
import type { HubTerminal, Vehicle } from '../../types';

const Shifts = () => {
  const { shift, setShift, allocation, sessionOrders } = useDriverSession();
  const hubs = useMemo(() => sampleData.hubTerminals as HubTerminal[], []);
  const vehicles = useMemo(() => sampleData.vehicles as Vehicle[], []);

  const vehicle = useMemo(() => {
    const vid = shift?.vehicleId ?? allocation?.vehicleId;
    if (!vid) return undefined;
    return vehicles.find((v) => v.id === vid);
  }, [shift, allocation, vehicles]);

  function destName(id: string) {
    return hubs.find((h) => h.id === id)?.name ?? id;
  }

  function startShift() {
    if (!shift || !allocation || shift.status !== 'scheduled') return;
    setShift({
      ...shift,
      status: 'active',
      startedAt: new Date().toISOString(),
    });
  }

  const startDisabled = !allocation || !shift || shift.status !== 'scheduled';
  const hasPlan = !!(shift || allocation);

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-xl font-semibold my-4">Shifts</h1>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        {!hasPlan ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">No shift or allocation for today.</p>
        ) : (
          <>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Vehicle</dt>
                <dd className="font-medium">
                  {vehicle ? `${vehicle.registration} (${vehicle.id})` : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Orders</dt>
                <dd className="font-medium">{shift ? shift.orderIds.length : 0}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Button type="button" disabled={startDisabled} onClick={startShift}>
                Start shift
              </Button>
              {!allocation ? (
                <p className="mt-2 text-xs text-slate-500">Needs a vehicle allocation for today.</p>
              ) : null}
            </div>
          </>
        )}
      </div>

      <h2 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Assigned deliveries</h2>
      {sessionOrders.length === 0 ? (
        <p className="text-sm text-slate-500">None.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {sessionOrders.map((o) => (
            <li key={o.id} className="px-3 py-2 text-sm">
              <div className="font-medium">{destName(o.destinationId)}</div>
              <div className="text-slate-600 dark:text-slate-400">
                {o.product} · {o.quantity.toLocaleString()}{' '}
                {sampleData.products.find((p) => p.code === o.product)?.unit ?? ''}
              </div>
              <div className="mt-1 text-xs capitalize text-slate-500">{o.status.replace(/_/g, ' ')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Shifts;
