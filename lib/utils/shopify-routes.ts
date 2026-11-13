export type ShopifySearchParams = Record<string, string | string[] | undefined>;

export const COLLECTION_SORT_OPTIONS = [
  ['manual', 'Featured'],
  ['best-selling', 'Best selling'],
  ['title-ascending', 'Alphabetically, A–Z'],
  ['title-descending', 'Alphabetically, Z–A'],
  ['price-ascending', 'Price: low to high'],
  ['price-descending', 'Price: high to low'],
  ['created-ascending', 'Date: old to new'],
  ['created-descending', 'Date: new to old'],
] as const;

export type CollectionSort = (typeof COLLECTION_SORT_OPTIONS)[number][0];

export function collectionSort(value: unknown, fallback: CollectionSort = 'manual'): CollectionSort {
  return COLLECTION_SORT_OPTIONS.some(([key]) => key === value) ? (value as CollectionSort) : fallback;
}

/** Bound anonymous numbered-pagination work before making upstream requests. */
export function pageNumber(value: unknown): number | undefined {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 1000 ? page : undefined;
}

export function pageHref(pathname: string, params: ShopifySearchParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'page' || key === 'after' || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) query.append(key, item);
  }
  if (page > 1) query.set('page', String(page));
  return `${pathname}${query.size ? `?${query}` : ''}`;
}

export function variantParam(id: string) {
  return id.replace(/^gid:\/\/shopify\/ProductVariant\//, '');
}

/** Own only product variant page reads; keep Hydrogen's commerce endpoints in its request pipeline. */
export function isNativeVariantPage(pathname: string, method: string, hasVariant: boolean) {
  return (
    hasVariant &&
    (method === 'GET' || method === 'HEAD') &&
    /^\/(?:products\/[^/]+|collections\/[^/]+\/products\/[^/]+)\/?$/.test(pathname)
  );
}

export const PAGE_SIZE = 12;

/** Translate Shopify theme page numbers to Storefront API cursors, without exposing cursors in URLs. */
export async function pageCursor(
  page: number,
  read: (first: number, after?: string) => Promise<{ hasNextPage: boolean; endCursor: string | null }>,
) {
  let remaining = (page - 1) * PAGE_SIZE;
  let after: string | undefined;
  while (remaining > 0) {
    const first = Math.min(250, remaining);
    const info = await read(first, after);
    if (!info.hasNextPage) return { exhausted: true as const, after: undefined };
    if (!info.endCursor) throw new Error('Shopify returned a missing pagination cursor');
    after = info.endCursor;
    remaining -= first;
  }
  return { exhausted: false as const, after };
}
