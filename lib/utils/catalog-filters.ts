import type { ShopifySearchParams } from './shopify-routes';

export type CatalogFilters = { availability?: boolean; min?: number; max?: number; productType?: string };

export function catalogFilters(params: ShopifySearchParams): CatalogFilters {
  const amount = (value: unknown) =>
    typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 1_000_000
      ? Number(value)
      : undefined;
  const min = amount(params.min);
  const max = amount(params.max);
  return {
    availability:
      params.availability === 'in-stock' ? true : params.availability === 'sold-out' ? false : undefined,
    min: min !== undefined && max !== undefined ? Math.min(min, max) : min,
    max: min !== undefined && max !== undefined ? Math.max(min, max) : max,
    productType:
      typeof params.product_type === 'string'
        ? params.product_type.trim().slice(0, 100) || undefined
        : undefined,
  };
}

export function productFilters(filters: CatalogFilters) {
  return [
    ...(filters.availability !== undefined ? [{ available: filters.availability }] : []),
    ...(filters.min !== undefined || filters.max !== undefined
      ? [{ price: { min: filters.min, max: filters.max } }]
      : []),
    ...(filters.productType ? [{ productType: filters.productType }] : []),
  ];
}

export function productSearchQuery(filters: CatalogFilters) {
  const quoted = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  return (
    [
      // Shopify's search parser treats a present boolean field as true even with
      // the literal "false" in this store. Negate the positive clause for sold out.
      ...(filters.availability !== undefined
        ? [filters.availability ? 'available_for_sale:true' : '-available_for_sale:true']
        : []),
      ...(filters.min !== undefined ? [`variants.price:>=${filters.min}`] : []),
      ...(filters.max !== undefined ? [`variants.price:<=${filters.max}`] : []),
      ...(filters.productType ? [`product_type:${quoted(filters.productType)}`] : []),
    ].join(' AND ') || undefined
  );
}
