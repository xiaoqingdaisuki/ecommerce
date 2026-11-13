import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storefrontHref } from '../lib/utils/storefront-url';
import { isNativeVariantPage, pageCursor, pageHref, pageNumber, variantParam } from '../lib/utils/shopify-routes';

test('CMS links preserve native Shopify paths, queries and fragments', () => {
  const domains = ['store.myshopify.com'];
  assert.equal(
    storefrontHref('/collections/all?sort_by=price-ascending&page=2', domains),
    '/collections/all?sort_by=price-ascending&page=2',
  );
  assert.equal(
    storefrontHref('https://store.myshopify.com/collections/all?sort_by=price-descending#products', domains),
    '/collections/all?sort_by=price-descending#products',
  );
  assert.equal(storefrontHref('https://store.myshopify.com/search?q=boots', domains), '/search?q=boots');
  assert.equal(
    storefrontHref('https://store.myshopify.com/collections/winter/products/boots?variant=123', domains),
    '/collections/winter/products/boots?variant=123',
  );
  assert.equal(storefrontHref('javascript:alert(1)', domains), undefined);
});

test('numbered pagination retains Shopify query parameters without exposing internal cursors', () => {
  assert.equal(
    pageHref('/collections/all', { sort_by: 'price-ascending', page: '1', after: 'private-cursor' }, 2),
    '/collections/all?sort_by=price-ascending&page=2',
  );
  assert.equal(
    pageHref('/search', { q: 'red boots', type: 'product', page: '2' }, 1),
    '/search?q=red+boots&type=product',
  );
  assert.equal(pageNumber(undefined), 1);
  assert.equal(pageNumber('2'), 2);
  for (const invalid of ['0', '-1', '1.5', 'Infinity', '9999999999999', ['2']])
    assert.equal(pageNumber(invalid), undefined);
});

test('theme variant URLs use numeric IDs while Storefront API continues to use GIDs', () => {
  assert.equal(variantParam('gid://shopify/ProductVariant/123456'), '123456');
  assert.equal(variantParam('123456'), '123456');
});

test('only native product variant reads bypass Hydrogen option-parameter redirects', () => {
  assert.equal(isNativeVariantPage('/products/boots', 'GET', true), true);
  assert.equal(isNativeVariantPage('/collections/winter/products/boots', 'HEAD', true), true);
  assert.equal(isNativeVariantPage('/products/boots', 'GET', false), false);
  assert.equal(isNativeVariantPage('/products/boots', 'POST', true), false);
  assert.equal(isNativeVariantPage('/api/cart', 'POST', true), false);
  assert.equal(isNativeVariantPage('/cart/add.js', 'GET', true), false);
  assert.equal(isNativeVariantPage('/api/products/boots', 'GET', true), false);
});

test('cursor translation skips exactly the requested page with bounded GraphQL window sizes', async () => {
  const reads: [number, string | undefined][] = [];
  const result = await pageCursor(23, async (first, after) => {
    reads.push([first, after]);
    return { hasNextPage: true, endCursor: `cursor-${reads.length}` };
  });
  assert.deepEqual(reads, [
    [250, undefined],
    [14, 'cursor-1'],
  ]);
  assert.deepEqual(result, { exhausted: false, after: 'cursor-2' });
  assert.deepEqual(await pageCursor(2, async () => ({ hasNextPage: false, endCursor: 'end' })), {
    exhausted: true,
    after: undefined,
  });
});
