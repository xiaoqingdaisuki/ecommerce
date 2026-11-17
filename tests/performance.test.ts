import assert from 'node:assert/strict';
import test from 'node:test';
import { metricRoute, validVital } from '../lib/utils/vitals';
import { catalogFetch } from '../lib/utils/catalog-fetch';

test('RUM sends only bounded metrics and normalized route templates', () => {
  assert.equal(metricRoute('/collections/summer/products/private-name'), '/products/[handle]');
  const metric = { name: 'LCP', value: 1234, rating: 'good', route: '/products/[handle]', device: 'mobile' };
  assert.equal(validVital(metric), true);
  for (const value of [NaN, Infinity, -1, 600001]) assert.equal(validVital({ ...metric, value }), false);
  assert.equal(validVital({ ...metric, route: '/search?q=customer@example.com' }), false);
  assert.equal(validVital({ ...metric, name: 'unknown' }), false);
});

test('public catalog bounds transient retries and does not retry permissions or aborted requests', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      if (calls === 1) throw new TypeError('fetch failed', { cause: { code: 'ECONNRESET' } });
      return new Response('{}');
    };
    assert.equal((await catalogFetch('https://example.test')).status, 200);
    assert.equal(calls, 2);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response(null, { status: 403 });
    };
    assert.equal((await catalogFetch('https://example.test')).status, 403);
    assert.equal(calls, 1);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response(null, { status: 503 });
    };
    assert.equal((await catalogFetch('https://example.test')).status, 503);
    assert.equal(calls, 3);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      throw new TypeError('fetch failed', { cause: { code: 'ECONNRESET' } });
    };
    await assert.rejects(catalogFetch('https://example.test', { signal: AbortSignal.abort() }));
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
