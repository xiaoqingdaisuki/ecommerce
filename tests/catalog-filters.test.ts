import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogFilters, productFilters, productSearchQuery } from '../lib/utils/catalog-filters';

test('catalog filters bound untrusted amounts and normalize reversed ranges', () => {
  assert.deepEqual(catalogFilters({ min: '800', max: '20.25', availability: 'sold-out' }), {
    min: 20.25,
    max: 800,
    availability: false,
    productType: undefined,
  });
  const filters = catalogFilters({
    min: '-10',
    max: '1e30',
    product_type: ['one', 'two'],
    availability: 'unknown',
  });
  assert.equal(productSearchQuery(filters), undefined);
  assert.deepEqual(productFilters(filters), []);
});

test('catalog search quotes merchant product types instead of interpreting search operators', () => {
  assert.equal(
    productSearchQuery({ productType: 'board" OR available_for_sale:false' }),
    'product_type:"board\\" OR available_for_sale:false"',
  );
  assert.equal(productSearchQuery({ productType: 'a\\b' }), 'product_type:"a\\\\b"');
});

test('native collection filters retain false availability and zero price', () => {
  assert.deepEqual(productFilters({ availability: false, min: 0, max: 0 }), [
    { available: false },
    { price: { min: 0, max: 0 } },
  ]);
  assert.equal(
    productSearchQuery({ availability: false, min: 0, max: 0 }),
    '-available_for_sale:true AND variants.price:>=0 AND variants.price:<=0',
  );
  assert.equal(productSearchQuery({ availability: true }), 'available_for_sale:true');
  assert.equal(
    productSearchQuery({ availability: false, productType: 'snowboard' }),
    '-available_for_sale:true AND product_type:"snowboard"',
  );
});
