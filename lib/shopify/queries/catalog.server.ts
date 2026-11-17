import 'server-only';
import type { ProductSortKeys, ProductCollectionSortKeys } from '@shopify/hydrogen/storefront-api-types';
import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogClient } from '@/lib/shopify/client';
import {
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_QUERY,
  PRODUCT_VARIANTS_QUERY,
  PRODUCTS_QUERY,
  PRODUCTS_CURSOR_QUERY,
  COLLECTION_CURSOR_QUERY,
  RECOMMENDATIONS_QUERY,
  PRODUCT_TYPES_QUERY,
} from '@/lib/shopify/queries/catalog';
import { catalogTags } from '@/lib/cache/tags';
import { collectionPreset } from '@/lib/utils/collection-presets';
import { PAGE_SIZE, pageCursor, type CollectionSort } from '@/lib/utils/shopify-routes';
import { productFilters, productSearchQuery, type CatalogFilters } from '@/lib/utils/catalog-filters';

export async function getFeaturedProducts() {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.products);
  const { data, errors } = await createCatalogClient().graphql(PRODUCTS_QUERY, { variables: { first: 8 } });
  if (errors?.length || !data) throw new Error('The product catalog is temporarily unavailable.');
  return data.products.nodes;
}

export async function getRecommendations(productId: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.products);
  const { data } = await createCatalogClient().graphql(RECOMMENDATIONS_QUERY, { variables: { productId } });
  const recommended = data?.productRecommendations?.filter((item) => item.id !== productId) ?? [];
  if (recommended.length) return recommended.slice(0, 4);
  return (await getFeaturedProducts())
    .filter((item) => item.id !== productId && item.availableForSale)
    .slice(0, 4);
}

export async function getProductTypes() {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.products);
  const { data, errors } = await createCatalogClient().graphql(PRODUCT_TYPES_QUERY);
  if (errors?.length || !data) throw new Error('Product filters are temporarily unavailable.');
  return [...new Set(data.productTypes.edges.map((item) => item.node).filter(Boolean))].sort();
}

export async function getCollections() {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.collections);
  const client = createCatalogClient();
  const { data, errors } = await client.graphql(COLLECTIONS_QUERY);
  if (errors?.length || !data) throw new Error('Collections are temporarily unavailable.');
  while (data.collections.pageInfo.hasNextPage) {
    const after = data.collections.pageInfo.endCursor;
    if (!after) throw new Error('Missing collection cursor');
    const more = await client.graphql(COLLECTIONS_QUERY, { variables: { after } });
    if (more.errors?.length || !more.data) throw new Error('Collections could not be loaded.');
    data.collections.nodes.push(...more.data.collections.nodes);
    data.collections.pageInfo = more.data.collections.pageInfo;
  }
  return data.collections.nodes;
}

export async function getProduct(handle: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.products, catalogTags.product(handle));
  const client = createCatalogClient();
  const { data, errors } = await client.graphql(PRODUCT_QUERY, { variables: { handle } });
  if (errors?.length || !data) throw new Error('This product could not be loaded.');
  while (data.product?.variants.pageInfo.hasNextPage) {
    const after = data.product.variants.pageInfo.endCursor;
    if (!after) throw new Error('Missing variant cursor');
    const more = await client.graphql(PRODUCT_VARIANTS_QUERY, { variables: { handle, after } });
    if (more.errors?.length || !more.data?.product) throw new Error('Product options could not be loaded.');
    data.product.variants.nodes.push(...more.data.product.variants.nodes);
    data.product.variants.pageInfo = more.data.product.variants.pageInfo;
  }
  return data.product;
}

function sortVariables(sort: CollectionSort): {
  products: { sortKey: ProductSortKeys; reverse: boolean };
  collection: { sortKey: ProductCollectionSortKeys; reverse: boolean };
} {
  const reverse = sort.endsWith('-descending');
  const sharedKey = sort.startsWith('price-')
    ? 'PRICE'
    : sort.startsWith('title-')
      ? 'TITLE'
      : sort.startsWith('created-')
        ? 'CREATED'
        : sort === 'best-selling'
          ? 'BEST_SELLING'
          : undefined;
  return {
    products: {
      sortKey: sharedKey === 'CREATED' ? ('CREATED_AT' as const) : (sharedKey ?? ('ID' as const)),
      reverse,
    },
    collection: { sortKey: sharedKey ?? ('MANUAL' as const), reverse },
  };
}

/** Shopify's implicit all-products collection exists even without a custom collection named all. */
export async function getAllProducts(
  page = 1,
  sort: CollectionSort = 'title-ascending',
  filters: CatalogFilters = {},
) {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.products);
  const client = createCatalogClient();
  const variables = { ...sortVariables(sort).products, query: productSearchQuery(filters) };
  const cursor = await pageCursor(page, async (first, after) => {
    const { data, errors } = await client.graphql(PRODUCTS_CURSOR_QUERY, {
      variables: { first, after, ...variables },
    });
    if (errors?.length || !data) throw new Error('Product pagination is temporarily unavailable.');
    return data.products.pageInfo;
  });
  if (cursor.exhausted) return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
  const { data, errors } = await client.graphql(PRODUCTS_QUERY, {
    variables: { first: PAGE_SIZE, after: cursor.after, ...variables },
  });
  if (errors?.length || !data) throw new Error('Products are temporarily unavailable.');
  return data.products;
}

export async function getCollection(
  handle: string,
  page = 1,
  sort: CollectionSort = 'manual',
  filters: CatalogFilters = {},
) {
  'use cache';
  cacheLife('catalog');
  cacheTag(catalogTags.products, catalogTags.collections, catalogTags.collection(handle));
  const preset = collectionPreset(handle);
  if (preset && !(await getCollections()).some((collection) => collection.handle === handle)) {
    return {
      id: handle,
      handle,
      title: preset.title,
      description: '',
      products: await getAllProducts(page, sort, filters),
    };
  }
  // The implicit Shopify "all" collection needs only the products query.
  if (handle === 'all' && !(await getCollections()).some((collection) => collection.handle === 'all')) {
    return {
      id: 'all',
      handle: 'all',
      title: 'All products',
      description: '',
      products: await getAllProducts(page, sort, filters),
    };
  }
  const client = createCatalogClient();
  const variables = { handle, ...sortVariables(sort).collection, filters: productFilters(filters) };
  const { data, errors } = await client.graphql(COLLECTION_QUERY, {
    variables: { first: PAGE_SIZE, ...variables },
  });
  if (errors?.length || !data) throw new Error('This collection could not be loaded.');
  if (!data.collection) {
    if (handle !== 'all') return null;
    return {
      id: 'all',
      handle: 'all',
      title: 'All products',
      description: '',
      products: await getAllProducts(page, sort, filters),
    };
  }
  if (page === 1) return data.collection;
  const cursor = await pageCursor(page, async (first, after) => {
    const result = await client.graphql(COLLECTION_CURSOR_QUERY, {
      variables: { first, after, ...variables },
    });
    if (result.errors?.length || !result.data?.collection)
      throw new Error('Collection pagination is temporarily unavailable.');
    return result.data.collection.products.pageInfo;
  });
  if (cursor.exhausted)
    return { ...data.collection, products: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } };
  const result = await client.graphql(COLLECTION_QUERY, {
    variables: { first: PAGE_SIZE, after: cursor.after, ...variables },
  });
  if (result.errors?.length || !result.data?.collection)
    throw new Error('This collection could not be loaded.');
  return result.data.collection;
}
