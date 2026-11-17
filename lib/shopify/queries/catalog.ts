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
  query Collection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!], $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id handle title description
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
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
      descriptionHtml
      seo { title description }
      images(first: 20) { nodes { url altText width height } }
      variants(first: 100) {
        nodes { id title availableForSale selectedOptions { name value } price { amount currencyCode } compareAtPrice { amount currencyCode } image { url altText width height } }
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
        nodes { id title availableForSale selectedOptions { name value } price { amount currencyCode } compareAtPrice { amount currencyCode } image { url altText width height } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`);

export type ProductCard = StorefrontApi.ResultOf<typeof PRODUCTS_QUERY>['products']['nodes'][number];
export type Product = NonNullable<StorefrontApi.ResultOf<typeof PRODUCT_QUERY>['product']>;
export type PurchaseProduct = Omit<Product, 'descriptionHtml' | 'seo'>;

export const PRODUCT_TYPES_QUERY = gql(`
  query ProductTypes {
    productTypes(first: 250) {
      edges { node }
    }
  }
`);

export const RECOMMENDATIONS_QUERY = gql(
  `
  query ProductRecommendations($productId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) { ...ProductCard }
  }
`,
  [PRODUCT_CARD],
);

export const PRODUCTS_CURSOR_QUERY = gql(`
  query ProductsCursor($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) { pageInfo { hasNextPage endCursor } }
  }
`);

export const COLLECTION_CURSOR_QUERY = gql(`
  query CollectionCursor($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!], $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) { pageInfo { hasNextPage endCursor } }
    }
  }
`);
