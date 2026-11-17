import type { CollectionSort } from './shopify-routes';

export const COLLECTION_PRESETS: Record<string, { title: string; sort: CollectionSort }> = {
  'best-sellers': { title: 'Best Sellers', sort: 'best-selling' },
  'new-arrivals': { title: 'New', sort: 'created-descending' },
};

export function collectionPreset(handle: string) {
  return Object.hasOwn(COLLECTION_PRESETS, handle) ? COLLECTION_PRESETS[handle] : undefined;
}
