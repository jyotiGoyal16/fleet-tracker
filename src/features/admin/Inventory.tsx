import { useMemo, useState } from 'react';
import { PRODUCT_CODES, TYPE_FILTER } from '../../constants';
import { sampleData } from '../../data/sampleData';
import Input from '../../components/Input';
import Select from '../../components/Select';
import { formatInventoryQty, productUnitsByCode } from '../../utils';
import type { HubTerminal } from '../../types';

const Inventory = () => {
  const locations = useMemo(() => sampleData.hubTerminals as HubTerminal[], []);
  const unitByCode = useMemo(() => productUnitsByCode(sampleData.products), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTER)[number]['value']>('all');

  const rows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return locations.filter((location) => {
      if (typeFilter !== 'all' && location.type !== typeFilter) return false;
      if (!normalizedSearch) return true;
      return (
        location.name.toLowerCase().includes(normalizedSearch) ||
        location.id.toLowerCase().includes(normalizedSearch) ||
        location.address.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [locations, searchQuery, typeFilter]);

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="text-xl font-semibold my-4">Inventory</h1>
      <div className="mb-3 flex flex-wrap justify-end items-end gap-3">
        <Input
          label="Search"
          name="inv-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Name, id, or address"
          className="min-w-[200px] max-w-sm flex-1"
        />
        <Select
          label="Location type"
          name="inv-type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          options={[...TYPE_FILTER]}
          className="w-44"
        />
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-slate-600">
              <th className="p-2">Location</th>
              <th className="p-2">Type</th>
              {PRODUCT_CODES.map((pc) => (
                <th key={pc.value} className="p-2">
                  {pc.label}{' '}
                  <span className="font-normal text-slate-500">({unitByCode.get(pc.value) ?? '—'})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2 + PRODUCT_CODES.length} className="p-4 text-center text-slate-500">
                  No locations match your filters.
                </td>
              </tr>
            ) : (
              rows.map((location) => (
                <tr key={location.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-xs text-slate-500">{location.id}</div>
                  </td>
                  <td className="p-2 capitalize">{location.type}</td>
                  {PRODUCT_CODES.map((pc) => {
                    const { text, low } = formatInventoryQty(location.inventory, pc.value);
                    return (
                      <td
                        key={pc.value}
                        className={
                          low
                            ? 'bg-amber-100 p-2 font-medium text-amber-950 dark:bg-amber-950/40 dark:text-amber-100'
                            : 'p-2'
                        }
                      >
                        {text}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;