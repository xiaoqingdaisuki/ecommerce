import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readWebhookBody, verifyWebhook, webhookTags } from '../lib/shopify/webhook';
import { serializeJsonLd } from '../lib/seo/json-ld';

test('Shopify signatures verify exact raw bytes, rejecting changed payloads and malformed signatures', () => {
  const body = Buffer.from('{"title":"Snowboard ☃"}');
  const secret = 'test-webhook-secret';
  const signature = createHmac('sha256', secret).update(body).digest('base64');
  assert.equal(verifyWebhook(body, signature, secret), true);
  assert.equal(verifyWebhook(Buffer.from('{ "title":"Snowboard ☃"}'), signature, secret), false);
  assert.equal(verifyWebhook(body, null, secret), false);
  assert.equal(verifyWebhook(body, 'garbage', secret), false);
  assert.equal(verifyWebhook(body, signature, 'wrong-secret'), false);
});

test('webhook invalidation covers dependent collection lists and home CMS', () => {
  assert.deepEqual(webhookTags('products/update'), ['catalog:products', 'catalog:collections']);
  assert.deepEqual(webhookTags('inventory_levels/update'), ['catalog:products', 'catalog:collections']);
  assert.deepEqual(webhookTags('pages/update'), ['content:pages', 'content:shop']);
  assert.deepEqual(webhookTags('orders/create'), []);
});

test('stream body limit rejects oversized payloads without trusting content-length', async () => {
  await assert.rejects(
    () => readWebhookBody(new Request('https://example.com', { method: 'POST', body: '12345' }), 4),
    RangeError,
  );
  assert.equal(
    Buffer.from(
      await readWebhookBody(new Request('https://example.com', { method: 'POST', body: '1234' }), 4),
    ).toString(),
    '1234',
  );
});

test('JSON-LD cannot escape its script element with catalog text', () => {
  const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
  assert.equal(output.includes('<'), false);
  assert.equal(JSON.parse(output).name, '</script><script>alert(1)</script>');
});
