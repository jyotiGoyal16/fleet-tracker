import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  driverDemoAllocation,
  driverDemoOrders,
  driverDemoShift,
} from '../data/sampleData';
import type { DriverShift, Order, VehicleAllocation } from '../types';

export type DriverSessionContextValue = {
  shift: DriverShift | null;
  setShift: Dispatch<SetStateAction<DriverShift | null>>;
  sessionOrders: Order[];
  setSessionOrders: Dispatch<SetStateAction<Order[]>>;
  allocation: VehicleAllocation | undefined;
};

const DriverSessionContext = createContext<DriverSessionContextValue | null>(null);

export function DriverSessionProvider({ children }: { children: ReactNode }) {
  const [shift, setShift] = useState<DriverShift | null>(() =>
    driverDemoShift ? { ...driverDemoShift } : null,
  );
  const [sessionOrders, setSessionOrders] = useState<Order[]>(() =>
    driverDemoOrders.map((order) => ({ ...order })),
  );

  const value: DriverSessionContextValue = {
    shift,
    setShift,
    sessionOrders,
    setSessionOrders,
    allocation: driverDemoAllocation,
  };

  return (
    <DriverSessionContext.Provider value={value}>
      {children}
    </DriverSessionContext.Provider>
  );
}

export function useDriverSession(): DriverSessionContextValue {
  const ctx = useContext(DriverSessionContext);
  if (!ctx) {
    throw new Error('useDriverSession must be used within a DriverSessionProvider');
  }
  return ctx;
}
