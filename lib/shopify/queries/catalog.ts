import { gql, type StorefrontApi } from '@shopify/hydrogen';
import { PRODUCT_CARD } from '../fragments/product';

export const PRODUCTS_QUERY = gql(
  `
  query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductCard }
      pageInfo { hasNextPage endCursor }
    }
  }
`,
  [PRODUCT_CARD],
);

export const COLLECTIONS_QUERY = gql(`
  query Collections($after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 100, after: $after) { nodes { id handle title description image { url altText width height } } pageInfo { hasNextPage endCursor } }
  }
`);

export const COLLECTION_QUERY = gql(
  `
  query Collection($handle: String!, $after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id handle title description
      products(first: 12, after: $after) {
        nodes { ...ProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`,
  [PRODUCT_CARD],
);

export const PRODUCT_QUERY = gql(
  `
  query Product($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductCard
      seo { title description }
      images(first: 6) { nodes { url altText width height } }
      variants(first: 100) {
        nodes { id title availableForSale selectedOptions { name value } price { amount currencyCode } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`,
  [PRODUCT_CARD],
);

export const PRODUCT_VARIANTS_QUERY = gql(`
  query ProductVariants($handle: String!, $after: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 100, after: $after) {
        nodes { id title availableForSale selectedOptions { name value } price { amount currencyCode } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`);

export type ProductCard = StorefrontApi.ResultOf<typeof PRODUCTS_QUERY>['products']['nodes'][number];
export type Product = NonNullable<StorefrontApi.ResultOf<typeof PRODUCT_QUERY>['product']>;
