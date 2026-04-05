import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { sampleData } from '../data/sampleData';
import type { Order } from '../types';

export type AdminOrdersContextValue = {
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
};

const AdminOrdersContext = createContext<AdminOrdersContextValue | null>(null);

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => sampleData.orders as Order[]);

  return (
    <AdminOrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </AdminOrdersContext.Provider>
  );
}

export function useAdminOrders(): AdminOrdersContextValue {
  const ctx = useContext(AdminOrdersContext);
  if (!ctx) {
    throw new Error('useAdminOrders must be used within an AdminOrdersProvider');
  }
  return ctx;
}
