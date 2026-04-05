import { useMemo, useState } from 'react';
import { PRODUCT_CODES, ORDER_STATUSES } from '../../constants';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { useAdminOrders } from '../../contexts/AdminOrdersContext';
import type { Order, OrderStatus } from '../../types';
import type { ProductCode } from '../../types/product';

const Orders = () => {
  const { orders, setOrders } = useAdminOrders();
  const [destId, setDestId] = useState('');
  const [product, setProduct] = useState<ProductCode>('diesel');
  const [qty, setQty] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const destOptions = useMemo(
    () => sampleData.hubTerminals.map((d) => ({ value: d.id, label: `${d.name} (${d.id})` })),
    [sampleData.hubTerminals],
  );

  const driverOptions = useMemo(
    () =>
      sampleData.drivers
        .filter((d) => d.active !== false)
        .map((d) => ({ value: d.id, label: `${d.name} (${d.id})` })),
    [sampleData.drivers],
  );

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  function resetCreateForm() {
    setDestId('');
    setProduct('diesel');
    setQty('');
    setDeliveryDate('');
    setFormErr({});
  }

  function closeCreateModal() {
    setCreateOpen(false);
    resetCreateForm();
  }

  function createOrder(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErr({});
    const e2: Record<string, string> = {};
    if (!destId) e2.dest = 'Choose a destination';
    const q = Number(qty);
    if (!qty.trim() || Number.isNaN(q) || q <= 0) e2.qty = 'Enter a positive quantity';
    if (!deliveryDate) e2.date = 'Pick a date';
    if (Object.keys(e2).length) {
      setFormErr(e2);
      return;
    }
    const row: Order = {
      id: `order-${Date.now()}`,
      destinationId: destId,
      product,
      quantity: q,
      deliveryDate,
      assignedDriverId: null,
      assignedVehicleId: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [row, ...prev]);
    closeCreateModal();
  }

  function assignDriver(orderId: string, driverId: string) {
    if (!driverId) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, assignedDriverId: driverId, status: 'assigned' as const }
          : o,
      ),
    );
  }

  function driverName(id: string | null | undefined) {
    if (!id) return '—';
    return sampleData.drivers.find((d) => d.id === id)?.name ?? id;
  }

  function destLabel(id: string) {
    return sampleData.hubTerminals.find((d) => d.id === id)?.name ?? id;
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold my-4">Orders</h1>
      </div>

      <div className="mb-2 flex flex-wrap justify-between items-end gap-2">
        <label className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <span>Status filter:</span>
          <Select
            name="sf"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            options={[
              { value: 'all', label: 'All' },
              ...ORDER_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') })),
            ]}
            className="w-48"
          />
        </label>
        <Button
          type="button"
          className="inline-flex items-center gap-1.5"
          onClick={() => setCreateOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 shrink-0"
            aria-hidden={true}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          New order
        </Button>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-600">
              <th className="p-2">ID</th>
              <th className="p-2">Destination</th>
              <th className="p-2">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Date</th>
              <th className="p-2">Driver</th>
              <th className="p-2">Status</th>
              <th className="p-2">Assign</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const canAssign = o.status === 'pending' && !o.assignedDriverId;
              return (
                <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 font-mono text-xs">{o.id}</td>
                  <td className="p-2">{destLabel(o.destinationId)}</td>
                  <td className="p-2">{o.product}</td>
                  <td className="p-2">{o.quantity}</td>
                  <td className="p-2">{o.deliveryDate}</td>
                  <td className="p-2">{driverName(o.assignedDriverId)}</td>
                  <td className="p-2">{o.status.replace('_', ' ')}</td>
                  <td className="p-2">
                    {canAssign ? (
                      <select
                        className="max-w-[200px] rounded border border-slate-300 px-1 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                        defaultValue=""
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) assignDriver(o.id, v);
                        }}
                      >
                        <option value="">Assign driver…</option>
                        {driverOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <Modal title="Create New order" onClose={closeCreateModal}>
          <form onSubmit={createOrder} className="space-y-3">
            <Select
              label="Destination"
              name="dest"
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              options={destOptions}
              error={formErr.dest}
            />
            <Select
              label="Product"
              name="product"
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductCode)}
              options={PRODUCT_CODES}
            />
            <Input
              label="Quantity"
              name="qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              error={formErr.qty}
              type="number"
            />
            <Input
              label="Delivery date"
              name="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              error={formErr.date}
              type="date"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" onClick={closeCreateModal}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Orders;