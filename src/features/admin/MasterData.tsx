import { useMemo, useState, type FormEvent } from 'react';
import { TABS, PRODUCT_CODES, PRODUCT_UNITS } from '../../constants';
import { sampleData } from '../../data/sampleData';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { pickBySearch } from '../../utils';
import type { Dialog, Driver, HubTerminal, Product, Tab, Vehicle } from '../../types';
import type { ProductCode, ProductUnit } from '../../types/product';

export default function MasterData() {
  const [locations, setLocations] = useState<HubTerminal[]>(
    () => sampleData.hubTerminals as HubTerminal[],
  );
  const [products, setProducts] = useState<Product[]>(() => sampleData.products.map((p) => ({ ...p })));
  const [drivers, setDrivers] = useState<Driver[]>(() => sampleData.drivers.map((d) => ({ ...d })));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => sampleData.vehicles.map((v) => ({ ...v })));
  const [tab, setTab] = useState<Tab>('hubs');
  const [search, setSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [vehicleType, setVehicleType] = useState('all');
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});

  // form fields (shared keys where possible)
  const [f, setF] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    diesel: '',
    petrol: '',
    cng: '',
    lpg: '',
    code: 'diesel' as ProductCode,
    unit: 'L' as ProductUnit,
    desc: '',
    license: '',
    phone: '',
    active: true,
    reg: '',
    cap: '',
    vtype: '',
  });

  const openNew = (kind: Dialog['kind']) => {
    setErr({});
    if (kind === 'hub' || kind === 'terminal') {
      setF((x) => ({
        ...x,
        name: '',
        address: '',
        lat: '',
        lng: '',
        diesel: '',
        petrol: '',
        cng: '',
        lpg: '',
      }));
      setDialog({ kind });
    } else if (kind === 'product') {
      setF((x) => ({ ...x, name: '', code: 'diesel', unit: 'L', desc: '' }));
      setDialog({ kind });
    } else if (kind === 'driver') {
      setF((x) => ({ ...x, name: '', license: '', phone: '', active: true }));
      setDialog({ kind });
    } else {
      setF((x) => ({ ...x, reg: '', cap: '', vtype: '' }));
      setDialog({ kind });
    }
  };

  const openEdit = (d: Dialog) => {
    setErr({});
    if (d.kind === 'hub' || d.kind === 'terminal') {
      const h = d.item!;
      setF({
        ...f,
        name: h.name,
        address: h.address,
        lat: String(h.coordinates.lat),
        lng: String(h.coordinates.lng),
        diesel: String(h.inventory.diesel),
        petrol: String(h.inventory.petrol),
        cng: h.inventory.cng != null ? String(h.inventory.cng) : '',
        lpg: h.inventory.lpg != null ? String(h.inventory.lpg) : '',
      });
    } else if (d.kind === 'product') {
      const p = d.item!;
      setF({ ...f, name: p.name, code: p.code, unit: p.unit, desc: p.description ?? '' });
    } else if (d.kind === 'driver') {
      const dr = d.item!;
      setF({ ...f, name: dr.name, license: dr.license, phone: dr.phone, active: dr.active !== false });
    } else if (d.kind === 'vehicle') {
      const v = d.item!;
      setF({ ...f, reg: v.registration, cap: String(v.capacity), vtype: v.type });
    }
    setDialog(d);
  };

  const hubs = useMemo(
    () => pickBySearch(locations.filter((l) => l.type === 'hub'), search),
    [locations, search],
  );
  const terms = useMemo(
    () => pickBySearch(locations.filter((l) => l.type === 'terminal'), search),
    [locations, search],
  );
  const prods = useMemo(() => pickBySearch(products, search), [products, search]);
  const drvs = useMemo(() => {
    let d = pickBySearch(drivers, search);
    if (driverFilter === 'active') d = d.filter((x) => x.active !== false);
    if (driverFilter === 'inactive') d = d.filter((x) => x.active === false);
    return d;
  }, [drivers, search, driverFilter]);
  const vehs = useMemo(() => {
    let v = pickBySearch(vehicles, search);
    if (vehicleType !== 'all') v = v.filter((x) => x.type === vehicleType);
    return v;
  }, [vehicles, search, vehicleType]);
  const typeOpts = useMemo(() => ['all', ...new Set(vehicles.map((v) => v.type))], [vehicles]);

  function save(e: FormEvent) {
    e.preventDefault();
    setErr({});
    if (!dialog) return;

    if (dialog.kind === 'hub' || dialog.kind === 'terminal') {
      const e2: Record<string, string> = {};
      if (!f.name.trim()) e2.name = 'Required';
      if (!f.address.trim()) e2.address = 'Required';
      const la = Number(f.lat);
      const lo = Number(f.lng);
      if (Number.isNaN(la) || la < -90 || la > 90) e2.lat = 'Invalid latitude';
      if (Number.isNaN(lo) || lo < -180 || lo > 180) e2.lng = 'Invalid longitude';
      const d = Number(f.diesel);
      const p = Number(f.petrol);
      if (Number.isNaN(d) || d < 0) e2.diesel = 'Invalid';
      if (Number.isNaN(p) || p < 0) e2.petrol = 'Invalid';
      if (Object.keys(e2).length) {
        setErr(e2);
        return;
      }
      const row: HubTerminal = {
        id: dialog.item?.id ?? (dialog.kind === 'hub' ? `hub-${Date.now()}` : `term-${Date.now()}`),
        name: f.name.trim(),
        type: dialog.kind,
        address: f.address.trim(),
        coordinates: { lat: la, lng: lo },
        inventory: {
          diesel: d,
          petrol: p,
          ...(f.cng.trim() ? { cng: Number(f.cng) } : {}),
          ...(f.lpg.trim() ? { lpg: Number(f.lpg) } : {}),
        },
      };
      if (dialog.item) {
        setLocations((xs) => xs.map((x) => (x.id === row.id ? row : x)));
      } else {
        setLocations((xs) => [...xs, row]);
      }
    } else if (dialog.kind === 'product') {
      const e2: Record<string, string> = {};
      if (!f.name.trim()) e2.name = 'Required';
      if (Object.keys(e2).length) {
        setErr(e2);
        return;
      }
      const id = dialog.item?.id ?? f.code;
      if (!dialog.item && products.some((p) => p.id === id)) {
        setErr({ code: 'Product id already exists' });
        return;
      }
      const row: Product = {
        id,
        name: f.name.trim(),
        code: f.code,
        unit: f.unit,
        description: f.desc.trim() || undefined,
      };
      if (dialog.item) setProducts((xs) => xs.map((x) => (x.id === row.id ? row : x)));
      else setProducts((xs) => [...xs, row]);
    } else if (dialog.kind === 'driver') {
      const e2: Record<string, string> = {};
      if (!f.name.trim()) e2.name = 'Required';
      if (!f.license.trim()) e2.license = 'Required';
      const digits = f.phone.replace(/\D/g, '');
      if (digits.length < 10) e2.phone = 'Need at least 10 digits';
      if (Object.keys(e2).length) {
        setErr(e2);
        return;
      }
      const lic = f.license.trim().toUpperCase();
      if (
        drivers.some(
          (d) => d.license.toUpperCase() === lic && d.id !== dialog.item?.id,
        )
      ) {
        setErr({ license: 'License already used' });
        return;
      }
      const row: Driver = {
        id: dialog.item?.id ?? `driver-${Date.now()}`,
        name: f.name.trim(),
        license: f.license.trim(),
        phone: f.phone.trim(),
        active: f.active,
      };
      if (dialog.item) setDrivers((xs) => xs.map((x) => (x.id === row.id ? row : x)));
      else setDrivers((xs) => [...xs, row]);
    } else {
      const e2: Record<string, string> = {};
      if (!f.reg.trim()) e2.reg = 'Required';
      const c = Number(f.cap);
      if (Number.isNaN(c) || c <= 0) e2.cap = 'Invalid capacity';
      if (!f.vtype.trim()) e2.vtype = 'Required';
      if (Object.keys(e2).length) {
        setErr(e2);
        return;
      }
      const reg = f.reg.trim().toUpperCase();
      if (
        vehicles.some(
          (v) => v.registration.toUpperCase() === reg && v.id !== dialog.item?.id,
        )
      ) {
        setErr({ reg: 'Registration already used' });
        return;
      }
      const row: Vehicle = {
        id: dialog.item?.id ?? `veh-${Date.now()}`,
        registration: reg,
        capacity: c,
        type: f.vtype.trim(),
      };
      if (dialog.item) setVehicles((xs) => xs.map((x) => (x.id === row.id ? row : x)));
      else setVehicles((xs) => [...xs, row]);
    }
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-xl font-semibold my-4">Master data</h1>

      <div className="mb-3 flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSearch('');
            }}
            className={`rounded px-3 py-1 text-sm ${
              tab === t.id ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <Input
          label="Search"
          name="q"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        {tab === 'drivers' ? (
          <Select
            label="Filter"
            name="df"
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value as typeof driverFilter)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            className="w-36"
          />
        ) : null}
        {tab === 'vehicles' ? (
          <Select
            label="Type"
            name="vt"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            options={typeOpts.map((x) => ({ value: x, label: x === 'all' ? 'All' : x }))}
            className="w-36"
          />
        ) : null}
        <Button
          onClick={() =>
            openNew(
              tab === 'hubs'
                ? 'hub'
                : tab === 'terminals'
                  ? 'terminal'
                  : tab === 'products'
                    ? 'product'
                    : tab === 'drivers'
                      ? 'driver'
                      : 'vehicle',
            )
          }
        >
          Add
        </Button>
      </div>

      {tab === 'hubs' ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-1">Name</th>
              <th className="py-1">Address</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {hubs.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{r.name}</td>
                <td className="py-1">{r.address}</td>
                <td className="py-1 text-right">
                  <Button variant="icon-only" onClick={() => openEdit({ kind: 'hub', item: r })}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === 'terminals' ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-1">Name</th>
              <th className="py-1">Address</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {terms.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{r.name}</td>
                <td className="py-1">{r.address}</td>
                <td className="py-1 text-right">
                  <Button variant="icon-only" onClick={() => openEdit({ kind: 'terminal', item: r })}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === 'products' ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-1">Name</th>
              <th className="py-1">Code</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {prods.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{r.name}</td>
                <td className="py-1">{r.code}</td>
                <td className="py-1 text-right">
                  <Button variant="icon-only" onClick={() => openEdit({ kind: 'product', item: r })}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === 'drivers' ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-1">Name</th>
              <th className="py-1">Phone</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {drvs.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{r.name}</td>
                <td className="py-1">{r.phone}</td>
                <td className="py-1 text-right">
                  <Button variant="icon-only" onClick={() => openEdit({ kind: 'driver', item: r })}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {tab === 'vehicles' ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-1">Reg</th>
              <th className="py-1">Type</th>
              <th className="py-1">Cap</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {vehs.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{r.registration}</td>
                <td className="py-1">{r.type}</td>
                <td className="py-1">{r.capacity}</td>
                <td className="py-1 text-right">
                  <Button variant="icon-only" onClick={() => openEdit({ kind: 'vehicle', item: r })}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {dialog ? (
        <Modal
          title={
            dialog.item ? 'Edit' : 'Add'
          }
          onClose={() => setDialog(null)}
        >
          <form onSubmit={save} className="space-y-2">
            {dialog.kind === 'hub' || dialog.kind === 'terminal' ? (
              <>
                <Input label="Name" name="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={err.name} />
                <Input label="Address" name="address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} error={err.address} />
                <Input label="Latitude" name="lat" value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} error={err.lat} />
                <Input label="Longitude" name="lng" value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} error={err.lng} />
                <Input label="Diesel" name="diesel" value={f.diesel} onChange={(e) => setF({ ...f, diesel: e.target.value })} error={err.diesel} />
                <Input label="Petrol" name="petrol" value={f.petrol} onChange={(e) => setF({ ...f, petrol: e.target.value })} error={err.petrol} />
                <Input label="CNG (opt)" name="cng" value={f.cng} onChange={(e) => setF({ ...f, cng: e.target.value })} />
                <Input label="LPG (opt)" name="lpg" value={f.lpg} onChange={(e) => setF({ ...f, lpg: e.target.value })} />
              </>
            ) : null}
            {dialog.kind === 'product' ? (
              <>
                <Input label="Name" name="pname" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={err.name} />
                <Select
                  label="Code"
                  name="code"
                  value={f.code}
                  disabled={!!dialog.item}
                  onChange={(e) => setF({ ...f, code: e.target.value as ProductCode })}
                  options={PRODUCT_CODES.map((c) => ({ value: c.value, label: c.label }))}
                  error={err.code}
                />
                <Select
                  label="Unit"
                  name="unit"
                  value={f.unit}
                  onChange={(e) => setF({ ...f, unit: e.target.value as ProductUnit })}
                  options={PRODUCT_UNITS.map((c) => ({ value: c.value, label: c.label }))}
                />
                <Input label="Description" name="desc" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
              </>
            ) : null}
            {dialog.kind === 'driver' ? (
              <>
                <Input label="Name" name="dname" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={err.name} />
                <Input label="License" name="lic" value={f.license} onChange={(e) => setF({ ...f, license: e.target.value })} error={err.license} />
                <Input label="Phone" name="ph" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={err.phone} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
                  Active
                </label>
              </>
            ) : null}
            {dialog.kind === 'vehicle' ? (
              <>
                <Input label="Registration" name="reg" value={f.reg} onChange={(e) => setF({ ...f, reg: e.target.value })} error={err.reg} />
                <Input label="Capacity (L)" name="cap" value={f.cap} onChange={(e) => setF({ ...f, cap: e.target.value })} error={err.cap} />
                <Input label="Type" name="vtype" value={f.vtype} onChange={(e) => setF({ ...f, vtype: e.target.value })} error={err.vtype} />
              </>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="icon-only" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
