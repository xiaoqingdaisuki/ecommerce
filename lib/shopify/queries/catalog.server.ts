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
} from '@/lib/shopify/queries/catalog';
import { catalogTags } from '@/lib/cache/tags';
import { PAGE_SIZE, pageCursor, type CollectionSort } from '@/lib/utils/shopify-routes';

export async function getFeaturedProducts() {
  'use cache: remote';
  cacheLife('minutes');
  cacheTag(catalogTags.products);
  const { data, errors } = await createCatalogClient().graphql(PRODUCTS_QUERY, { variables: { first: 8 } });
  if (errors?.length || !data) throw new Error('The product catalog is temporarily unavailable.');
  return data.products.nodes;
}

export async function getCollections() {
  'use cache: remote';
  cacheLife('minutes');
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
  'use cache: remote';
  cacheLife('minutes');
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
    products: { sortKey: sharedKey === 'CREATED' ? ('CREATED_AT' as const) : (sharedKey ?? ('ID' as const)), reverse },
    collection: { sortKey: sharedKey ?? ('MANUAL' as const), reverse },
  };
}

/** Shopify's implicit all-products collection exists even without a custom collection named all. */
export async function getAllProducts(page = 1, sort: CollectionSort = 'title-ascending') {
  const client = createCatalogClient();
  const variables = sortVariables(sort).products;
  const cursor = await pageCursor(page, async (first, after) => {
    const { data, errors } = await client.graphql(PRODUCTS_CURSOR_QUERY, { variables: { first, after, ...variables } });
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

export async function getCollection(handle: string, page = 1, sort: CollectionSort = 'manual') {
  const client = createCatalogClient();
  const variables = { handle, ...sortVariables(sort).collection };
  const { data, errors } = await client.graphql(COLLECTION_QUERY, { variables: { first: PAGE_SIZE, ...variables } });
  if (errors?.length || !data) throw new Error('This collection could not be loaded.');
  if (!data.collection) {
    if (handle !== 'all') return null;
    return {
      id: 'all',
      handle: 'all',
      title: 'All products',
      description: '',
      products: await getAllProducts(page, sort === 'manual' ? 'title-ascending' : sort),
    };
  }
  if (page === 1) return data.collection;
  const cursor = await pageCursor(page, async (first, after) => {
    const result = await client.graphql(COLLECTION_CURSOR_QUERY, { variables: { first, after, ...variables } });
    if (result.errors?.length || !result.data?.collection)
      throw new Error('Collection pagination is temporarily unavailable.');
    return result.data.collection.products.pageInfo;
  });
  if (cursor.exhausted)
    return { ...data.collection, products: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } };
  const result = await client.graphql(COLLECTION_QUERY, {
    variables: { first: PAGE_SIZE, after: cursor.after, ...variables },
  });
  if (result.errors?.length || !result.data?.collection) throw new Error('This collection could not be loaded.');
  return result.data.collection;
}
