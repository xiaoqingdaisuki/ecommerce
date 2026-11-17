import { gql } from '@shopify/hydrogen';

export const PRODUCT_CARD = gql(`
  fragment ProductCard on Product {
    id handle title vendor description availableForSale productType
    featuredImage { url altText width height }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    selectedOrFirstAvailableVariant {
      id availableForSale
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      image { url altText width height }
    }
  }
`);
