import assert from 'node:assert/strict';
import { test } from 'node:test';
import { initialVariant } from '../lib/utils/product-variant';

const variants = [
  { id: 'gid://shopify/ProductVariant/1', availableForSale: false, image: 'sold-out.jpg', price: 100 },
  { id: 'gid://shopify/ProductVariant/2', availableForSale: true, image: 'available.jpg', price: 150 },
];

test('default purchase image and price resolve to the first available variant, not the first photo', () => {
  assert.deepEqual(initialVariant(variants), variants[1]);
  assert.equal(initialVariant(variants)?.image, 'available.jpg');
});

test('explicit native or GID selection preserves a sold-out option; unknown IDs fall back safely', () => {
  assert.equal(initialVariant(variants, '1'), variants[0]);
  assert.equal(initialVariant(variants, variants[0].id), variants[0]);
  assert.equal(initialVariant(variants, '999'), variants[1]);
  assert.equal(initialVariant(variants.map((v) => ({ ...v, availableForSale: false })))?.id, variants[0].id);
  assert.equal(initialVariant([]), undefined);
});
