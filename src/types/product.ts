export type ProductCode = 'diesel' | 'petrol' | 'cng' | 'lpg';

export type ProductUnit = 'L' | 'kg';

export interface Product {
    id: string;
    name: string;
    code: ProductCode;
    unit: ProductUnit;
    description?: string;
}