import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductCard } from '../components/product/product-card';
import { CommerceProvider } from '../components/ui/commerce-provider';
import type { ProductCard as CardData } from '../lib/shopify/queries/catalog';

test('card never combines the lowest price with a different variant’s compare-at price', () => {
  const usd = (amount: string) => ({ amount, currencyCode: 'USD' as const });
  const product: CardData = {
    id: 'gid://shopify/Product/1',
    handle: 'regression',
    title: 'Regression product',
    vendor: '',
    description: '',
    availableForSale: true,
    productType: '',
    featuredImage: null,
    priceRange: { minVariantPrice: usd('100') },
    compareAtPriceRange: { minVariantPrice: usd('160') },
    selectedOrFirstAvailableVariant: {
      id: 'gid://shopify/ProductVariant/1',
      availableForSale: true,
      price: usd('100'),
      compareAtPrice: usd('200'),
      image: null,
    },
  };
  const render = () =>
    renderToStaticMarkup(createElement(CommerceProvider, null, createElement(ProductCard, { product })));
  assert.match(render(), /50% OFF/);
  assert.doesNotMatch(render(), /37% OFF|160\.00/);
  product.selectedOrFirstAvailableVariant!.compareAtPrice = null;
  assert.doesNotMatch(render(), /% OFF|<del/);
});
