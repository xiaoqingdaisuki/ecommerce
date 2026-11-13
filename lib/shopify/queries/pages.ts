import { gql } from '@shopify/hydrogen';

export const SITEMAP_QUERY = gql(`
  query Sitemap($after: String) {
    products(first: 250, after: $after) { nodes { handle updatedAt } pageInfo { endCursor hasNextPage } }
  }
`);

export const CMS_SITEMAP_QUERY = gql(`
  query CmsSitemap($after: String) {
    pages(first: 250, after: $after) { nodes { handle updatedAt } pageInfo { hasNextPage endCursor } }
  }
`);
