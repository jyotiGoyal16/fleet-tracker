import { inventoryThresholds } from './data/sampleData';
import type { HubTerminal, Inventory, Order } from './types';
import type { Product, ProductCode } from './types/product';

export function formatInventoryQty(inventory: Inventory, productCode: ProductCode) {
  const quantity = inventory[productCode];
  if (quantity == null) return { text: '—', low: false };
  const minStockThreshold = inventoryThresholds[productCode];
  return {
    text: quantity.toLocaleString(),
    low: quantity < minStockThreshold,
  };
}

export function productUnitsByCode(products: Product[]) {
  const unitsByProductCode = new Map<ProductCode, string>();
  for (const product of products) {
    unitsByProductCode.set(product.code, product.unit);
  }
  return unitsByProductCode;
}

export function addReceivedAtDestination(
  hubs: HubTerminal[],
  destinationId: string,
  product: Order['product'],
  deliveredQuantity: number,
): HubTerminal[] {
  return hubs.map((hub) => {
    if (hub.id !== destinationId) return hub;
    const nextInventory = { ...hub.inventory };
    if (product === 'diesel') nextInventory.diesel += deliveredQuantity;
    else if (product === 'petrol') nextInventory.petrol += deliveredQuantity;
    else if (product === 'cng') nextInventory.cng = (nextInventory.cng ?? 0) + deliveredQuantity;
    else if (product === 'lpg') nextInventory.lpg = (nextInventory.lpg ?? 0) + deliveredQuantity;
    return { ...hub, inventory: nextInventory };
  });
}

export function isOrderOpen(order: Order) {
  return (
    order.status !== 'delivered' &&
    order.status !== 'failed' &&
    order.status !== 'cancelled'
  );
}

export function orderStatusBadgeClass(status: Order['status']): string {
  const baseClasses = 'rounded px-2 py-0.5 text-xs font-medium capitalize';
  switch (status) {
    case 'delivered':
      return `${baseClasses} bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200`;
    case 'failed':
      return `${baseClasses} bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-200`;
    case 'cancelled':
      return `${baseClasses} bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200`;
    case 'assigned':
    case 'pending':
    case 'in_transit':
    default:
      return `${baseClasses} bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200`;
  }
}

export function pickBySearch<T extends { id: string }>(items: T[], query: string): T[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return items;
  return items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(normalizedQuery),
  );
}
