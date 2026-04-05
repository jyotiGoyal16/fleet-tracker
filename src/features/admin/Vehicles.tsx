import { useMemo, useState } from 'react';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import type { Driver, Vehicle, VehicleAllocation } from '../../types';

const Vehicles = () => {
  const vehicles = useMemo(() => sampleData.vehicles as Vehicle[], []);
  const drivers = useMemo(() => sampleData.drivers as Driver[], []);

  const [allocations, setAllocations] = useState<VehicleAllocation[]>(() =>
    sampleData.vehicleAllocations.map((a) => ({ ...a })),
  );

  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [date, setDate] = useState('');
  const [formErr, setFormErr] = useState('');
  const [allocOpen, setAllocOpen] = useState(false);

  const [viewMonth, setViewMonth] = useState(
    () => sampleData.vehicleAllocations[0]?.date.slice(0, 7) ?? new Date().toISOString().slice(0, 7),
  );

  const vehicleOpts = useMemo(
    () => vehicles.map((v) => ({ value: v.id, label: `${v.registration} (${v.id})` })),
    [vehicles],
  );
  const driverOpts = useMemo(
    () =>
      drivers
        .filter((d) => d.active !== false)
        .map((d) => ({ value: d.id, label: `${d.name} (${d.id})` })),
    [drivers],
  );

  const vLabel = (id: string) => vehicles.find((v) => v.id === id)?.registration ?? id;
  const dLabel = (id: string) => drivers.find((d) => d.id === id)?.name ?? id;

  const tableRows = useMemo(() => {
    return [...allocations]
      .filter((a) => a.date.startsWith(viewMonth))
      .sort((a, b) => a.date.localeCompare(b.date) || a.vehicleId.localeCompare(b.vehicleId));
  }, [allocations, viewMonth]);

  function resetAllocForm() {
    setVehicleId('');
    setDriverId('');
    setDate('');
    setFormErr('');
  }

  function closeAllocModal() {
    setAllocOpen(false);
    resetAllocForm();
  }

  function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErr('');
    if (!vehicleId || !driverId || !date) {
      setFormErr('Pick vehicle, driver, and date.');
      return;
    }
    const taken = allocations.some((a) => a.vehicleId === vehicleId && a.date === date);
    if (taken) {
      setFormErr('That vehicle is already allocated on this date.');
      return;
    }
    setAllocations((prev) => [
      ...prev,
      { id: `alloc-${Date.now()}`, vehicleId, driverId, date },
    ]);
    closeAllocModal();
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-xl font-semibold my-4">Vehicle allocation</h1>

      <div className="mb-2 flex flex-wrap justify-between items-end gap-2">
        <label className="text-sm text-slate-700 dark:text-slate-300">
          Month:{' '}
          <input
            type="month"
            value={viewMonth}
            onChange={(e) => setViewMonth(e.target.value)}
            className="ml-1 rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
          />
        </label>
        <Button
          type="button"
          className="inline-flex items-center gap-1.5"
          onClick={() => setAllocOpen(true)}
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
          New allocation
        </Button>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-600">
              <th className="p-2">Date</th>
              <th className="p-2">Vehicle</th>
              <th className="p-2">Driver</th>
              <th className="p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">
                  No allocations in this month.
                </td>
              </tr>
            ) : (
              tableRows.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">{a.date}</td>
                  <td className="p-2">{vLabel(a.vehicleId)}</td>
                  <td className="p-2">{dLabel(a.driverId)}</td>
                  <td className="p-2 text-slate-600 dark:text-slate-400">{a.notes ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {allocOpen && (
        <Modal title="New allocation" onClose={closeAllocModal}>
          <form onSubmit={submit} className="space-y-3">
            <Select
              label="Vehicle"
              name="v"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              options={[{ value: '', label: 'Select…' }, ...vehicleOpts]}
            />
            <Select
              label="Driver"
              name="d"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              options={[{ value: '', label: 'Select…' }, ...driverOpts]}
            />
            <Input
              label="Date"
              name="ad"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {formErr ? <p className="text-sm text-red-600">{formErr}</p> : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" onClick={closeAllocModal}>
                Cancel
              </Button>
              <Button type="submit">Allocate</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Vehicles;
