import type { Driver } from "./driver";
import type { HubTerminal } from "./hub";
import type { Product } from "./product";
import type { Vehicle } from "./vehicle";

export type Tab = 'hubs' | 'terminals' | 'products' | 'drivers' | 'vehicles';

export type Dialog =
  | { kind: 'hub' | 'terminal'; item?: HubTerminal }
  | { kind: 'product'; item?: Product }
  | { kind: 'driver'; item?: Driver }
  | { kind: 'vehicle'; item?: Vehicle };
