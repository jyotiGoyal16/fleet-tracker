import { useMemo, useState } from 'react';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useDriverSession } from '../../contexts/DriverSessionContext';
import {
  addReceivedAtDestination,
  isOrderOpen,
  orderStatusBadgeClass,
} from '../../utils';
import type { HubTerminal } from '../../types';

const Deliveries = () => {
  const { shift, setShift, sessionOrders, setSessionOrders } = useDriverSession();
  const [sessionHubs, setSessionHubs] = useState<HubTerminal[]>(sampleData.hubTerminals);
  const [toast, setToast] = useState<string | null>(null);
  const [failId, setFailId] = useState<string | null>(null);
  const [failReason, setFailReason] = useState('');

  const hubs = useMemo(() => sampleData.hubTerminals as HubTerminal[], []);

  function destName(id: string) {
    return sessionHubs.find((h) => h.id === id)?.name ?? hubs.find((h) => h.id === id)?.name ?? id;
  }

  const shiftActive = shift?.status === 'active';
  const canManageOrders =
    shift && (shift.status === 'scheduled' || shift.status === 'active');

  function markComplete(orderId: string) {
    const order = sessionOrders.find((o) => o.id === orderId);
    if (!order || !isOrderOpen(order)) return;
    setSessionOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'delivered' as const, completedAt: new Date().toISOString() }
          : o,
      ),
    );
    setSessionHubs((prev) =>
      addReceivedAtDestination(prev, order.destinationId, order.product, order.quantity),
    );
    setToast('Delivery completed. Destination inventory updated.');
    window.setTimeout(() => setToast(null), 4000);
  }

  function confirmFail() {
    if (!failId || !failReason.trim()) return;
    setSessionOrders((prev) =>
      prev.map((o) =>
        o.id === failId
          ? {
              ...o,
              status: 'failed' as const,
              failureReason: failReason.trim(),
              completedAt: new Date().toISOString(),
            }
          : o,
      ),
    );
    setFailId(null);
    setFailReason('');
  }

  function endShift() {
    if (!shift || shift.status !== 'active') return;
    setShift({ ...shift, status: 'completed', endedAt: new Date().toISOString() });
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-xl font-semibold my-4">Deliveries</h1>

      {toast ? (
        <div
          className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <Button type="button" disabled={!shiftActive} onClick={endShift}>
          End shift
        </Button>
      </div>

      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {sessionOrders.length === 0 ? (
          <li className="px-3 py-4 text-sm text-slate-500">No orders on this shift.</li>
        ) : (
          sessionOrders.map((o) => {
            const unit = sampleData.products.find((p) => p.code === o.product)?.unit ?? '';
            const showActions = Boolean(canManageOrders && isOrderOpen(o));
            return (
              <li key={o.id} className="flex flex-col gap-2 px-3 py-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {destName(o.destinationId)}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {o.product} · {o.quantity.toLocaleString()} {unit}
                    </div>
                  </div>
                  <span className={orderStatusBadgeClass(o.status)}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {o.failureReason ? (
                  <p className="text-xs text-red-600 dark:text-red-400">{o.failureReason}</p>
                ) : null}
                {showActions ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => markComplete(o.id)}>
                      Mark completed
                    </Button>
                    <button
                      type="button"
                      className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                      onClick={() => {
                        setFailId(o.id);
                        setFailReason('');
                      }}
                    >
                      Mark failed
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      {failId ? (
        <Modal title="Mark failed" onClose={() => setFailId(null)}>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              confirmFail();
            }}
          >
            <label className="mb-0.5 block text-sm text-slate-700 dark:text-slate-300">
              Reason
              <textarea
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                placeholder="What went wrong?"
                required
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" onClick={() => setFailId(null)}>
                Cancel
              </Button>
              <Button type="submit">Confirm</Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default Deliveries;
