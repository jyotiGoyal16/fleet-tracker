import { useState } from 'react';
import Deliveries from './Deliveries';
import DriverMap from './DriverMap';
import ShiftHistory from './ShiftHistory';
import Shifts from './Shifts';
import { DRIVER_APP_TABS } from '../../constants';

type DriverAppTabId = (typeof DRIVER_APP_TABS)[number]['id'];

const Driver = () => {
  const [tab, setTab] = useState<DriverAppTabId>('shift');

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-2 dark:border-slate-700">
        {DRIVER_APP_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-t-md px-3 py-2 text-sm ${
              tab === id
                ? 'bg-violet-600 font-medium text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'shift' ? (
        <Shifts />
      ) : tab === 'deliveries' ? (
        <Deliveries />
      ) : tab === 'history' ? (
        <ShiftHistory />
      ) : (
        <DriverMap />
      )}
    </div>
  );
};

export default Driver;
