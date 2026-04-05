export type ShiftStatus = 'scheduled' | 'active' | 'completed';

export interface DriverShift {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  status: ShiftStatus;
  allocationId: string;
  startedAt?: string;
  endedAt?: string;
  orderIds: string[];
}

export interface ShiftHistoryEntry {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  completedAt: string;
  deliveriesCompleted: number;
  ordersCompletedIds: string[];
  totalQuantityDelivered: number;
}