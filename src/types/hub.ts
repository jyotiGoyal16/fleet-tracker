import type { Inventory } from "./inventory";

export type HubTerminalType = 'hub' | 'terminal';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface HubTerminal {
    id: string;
    name: string;
    type: HubTerminalType;
    address: string;
    coordinates: Coordinates;
    inventory: Inventory;
    suppliesTerminalIds?: string[];
}