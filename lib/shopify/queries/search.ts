import { gql } from '@shopify/hydrogen';
import { PRODUCT_CARD } from '@/lib/shopify/fragments/product';

export const SEARCH_QUERY = gql(
  `
  query StoreSearch($query: String!, $first: Int!, $after: String, $types: [SearchType!], $sortKey: SearchSortKeys, $reverse: Boolean, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    search(query: $query, first: $first, after: $after, types: $types, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        __typename
        ... on Product { ...ProductCard }
        ... on Page { id title handle bodySummary }
        ... on Article { id title handle excerpt blog { handle } }
      }
      pageInfo { hasNextPage endCursor }
      totalCount
    }
  }
`,
  [PRODUCT_CARD],
);

export const SEARCH_CURSOR_QUERY = gql(`
  query SearchCursor($query: String!, $first: Int!, $after: String, $types: [SearchType!], $sortKey: SearchSortKeys, $reverse: Boolean, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    search(query: $query, first: $first, after: $after, types: $types, sortKey: $sortKey, reverse: $reverse) {
      pageInfo { hasNextPage endCursor }
    }
  }
`);
