import { useMemo } from 'react';
import { sampleData } from '../../data/sampleData';
import type { ShiftHistoryEntry } from '../../types';

const DRIVER_ID = 'driver-4';

const ShiftHistory = () => {
  const rows = useMemo(() => {
    return (sampleData.shiftHistory as ShiftHistoryEntry[])
      .filter((h) => h.driverId === DRIVER_ID)
      .sort((a, b) => b.date.localeCompare(a.date) || b.completedAt.localeCompare(a.completedAt));
  }, []);

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-xl font-semibold my-4">Shift history</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No past shifts yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {rows.map((h) => (
            <li key={h.id} className="px-3 py-3 text-sm">
              <div className="font-medium text-slate-900 dark:text-slate-100">{h.date}</div>
              <div className="mt-1 text-slate-600 dark:text-slate-400">
                {h.deliveriesCompleted}{' '}
                {h.deliveriesCompleted === 1 ? 'delivery' : 'deliveries'} completed
                {h.totalQuantityDelivered > 0
                  ? ` · ${h.totalQuantityDelivered.toLocaleString()} L/kg total`
                  : ''}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Finished {new Date(h.completedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShiftHistory;
