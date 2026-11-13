export const catalogTags = {
  products: 'catalog:products',
  collections: 'catalog:collections',
  product: (handle: string) => `product:${handle}`,
  collection: (handle: string) => `collection:${handle}`,
};
