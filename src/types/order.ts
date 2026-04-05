import type { Product } from "./product"

export type OrderStatus =
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface Order {
  id: string;
  destinationId: string;
  product: Product['code'];
  quantity: number;
  deliveryDate: string;
  assignedDriverId?: string | null;
  assignedVehicleId?: string | null;
  status: OrderStatus;
  createdAt: string;
  failureReason?: string;
  completedAt?: string | null;
}