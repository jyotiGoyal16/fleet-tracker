import type { Coordinates } from "./hub";

export type FleetDeliveryStatus =
  | 'idle'
  | 'en_route'
  | 'at_destination'
  | 'returning';

export interface Vehicle {
    id: string;
    registration: string;
    capacity: number;
    type: string;
}

export interface VehicleAllocation {
    id: string;
    vehicleId: string;
    driverId: string;
    date: string;
    notes?: string;
}

export interface VehicleLocation {
  vehicleId: string;
  driverId: string;
  coordinates: Coordinates;
  headingDeg?: number;
  speedKmh?: number;
  lastUpdated: string;
  activeOrderId?: string | null;
  deliveryStatus: FleetDeliveryStatus;
}