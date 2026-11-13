import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogClient } from '@/lib/shopify/client';
import {
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_QUERY,
  PRODUCT_VARIANTS_QUERY,
  PRODUCTS_QUERY,
} from '@/lib/shopify/queries/catalog';
import { catalogTags } from '@/lib/cache/tags';

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

/** Cursor and arbitrary search queries remain uncached to bound cache cardinality. */
export async function getProducts(query?: string, after?: string, sort = 'featured') {
  const sortKey =
    sort === 'price-asc' || sort === 'price-desc' ? 'PRICE' : sort === 'newest' ? 'CREATED_AT' : 'RELEVANCE';
  const { data, errors } = await createCatalogClient().graphql(PRODUCTS_QUERY, {
    variables: { first: 12, query, after, sortKey, reverse: sort === 'price-desc' || sort === 'newest' },
  });
  if (errors?.length || !data) throw new Error('Products are temporarily unavailable.');
  return data.products;
}

export async function getCollection(handle: string, after?: string) {
  const { data, errors } = await createCatalogClient().graphql(COLLECTION_QUERY, { variables: { handle, after } });
  if (errors?.length || !data) throw new Error('This collection could not be loaded.');
  return data.collection;
}
