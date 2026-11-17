import 'server-only';
import { createCartServerHandlers, gql } from '@shopify/hydrogen';

// Shopify owns cart persistence and mutations; no parallel custom cart reducer.
export const cartHandlers = createCartServerHandlers({
  fragment: gql(`fragment CartFragment on Cart {
    lines(first: 250) { nodes {
      discountAllocations(lineLevelOnly: false) { __typename targetType discountedAmount { amount currencyCode } }
    } }
  }`),
});
