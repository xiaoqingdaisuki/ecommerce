import 'server-only';
import type { SearchType } from '@shopify/hydrogen/storefront-api-types';
import { createCatalogClient } from '@/lib/shopify/client';
import { SEARCH_CURSOR_QUERY, SEARCH_QUERY } from './search';
import { PAGE_SIZE, pageCursor } from '@/lib/utils/shopify-routes';

export async function searchStore(query: string, page: number, type?: string, sort = 'relevance') {
  const names = { product: 'PRODUCT', page: 'PAGE', article: 'ARTICLE' } as const;
  const types: SearchType[] = type
    ? type.split(',').flatMap((key) => (names[key as keyof typeof names] ? [names[key as keyof typeof names]] : []))
    : ['PRODUCT', 'PAGE', 'ARTICLE'];
  const variables = {
    query,
    types: types.length ? types : ['PRODUCT' as const],
    sortKey: sort.startsWith('price-') ? ('PRICE' as const) : ('RELEVANCE' as const),
    reverse: sort === 'price-descending',
  };
  const client = createCatalogClient();
  const cursor = await pageCursor(page, async (first, after) => {
    const { data, errors } = await client.graphql(SEARCH_CURSOR_QUERY, { variables: { ...variables, first, after } });
    if (errors?.length || !data) throw new Error('Search pagination is temporarily unavailable.');
    return data.search.pageInfo;
  });
  if (cursor.exhausted) return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null }, totalCount: 0 };
  const { data, errors } = await client.graphql(SEARCH_QUERY, {
    variables: { ...variables, first: PAGE_SIZE, after: cursor.after },
  });
  if (errors?.length || !data) throw new Error('Search is temporarily unavailable.');
  return data.search;
}
