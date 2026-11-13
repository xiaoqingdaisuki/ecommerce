import { gql } from '@shopify/hydrogen';

export const PRODUCT_CARD = gql(`
  fragment ProductCard on Product {
    id handle title vendor description availableForSale
    featuredImage { url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
  }
`);
