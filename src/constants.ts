import type { FleetDeliveryStatus, OrderStatus, ProductCode, ProductUnit, Tab } from "./types";

const TABS: { id: Tab; label: string }[] = [
    { id: 'hubs', label: 'Hubs' },
    { id: 'terminals', label: 'Terminals' },
    { id: 'products', label: 'Products' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'vehicles', label: 'Vehicles' },
];
  
const PRODUCT_CODES: { value: ProductCode; label: string }[] = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'cng', label: 'CNG' },
    { value: 'lpg', label: 'LPG' },
];

const PRODUCT_UNITS: { value: ProductUnit; label: string }[] = [
    { value: 'L', label: 'L' },
    { value: 'kg', label: 'kg' },
];

const ORDER_STATUSES: OrderStatus[] = [
    'pending',
    'assigned',
    'in_transit',
    'delivered',
    'failed',
    'cancelled',
];

const DELIVERY_STATUSES: FleetDeliveryStatus[] = [
    'idle',
    'en_route',
    'at_destination',
    'returning',
];

const REFRESH_TIME_MS = 30_000;

const TYPE_FILTER = [
    { value: 'all', label: 'All locations' },
    { value: 'hub', label: 'Hubs only' },
    { value: 'terminal', label: 'Terminals only' },
];

const DRIVER_ID = 'driver-4';

const TODAY = '2026-04-05';

const DRIVER_APP_TABS = [
    { id: 'shift' as const, label: 'Shifts' },
    { id: 'deliveries' as const, label: 'Deliveries' },
    { id: 'map' as const, label: 'Live map' },
    { id: 'history' as const, label: 'History' },
];

export { 
    TABS, 
    PRODUCT_CODES, 
    PRODUCT_UNITS, 
    ORDER_STATUSES, 
    DELIVERY_STATUSES,
    REFRESH_TIME_MS,
    TYPE_FILTER,
    DRIVER_ID,
    TODAY,
    DRIVER_APP_TABS
};