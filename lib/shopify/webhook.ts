import { createHmac, timingSafeEqual } from 'node:crypto';
import { catalogTags } from '@/lib/cache/tags';

export function verifyWebhook(body: Uint8Array, signature: string | null, secret: string) {
  if (!signature || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(body).digest();
  const received = Buffer.from(signature, 'base64');
  return received.length === expected.length && timingSafeEqual(expected, received);
}

/** Broad product invalidation also refreshes changed collection memberships and prices. */
export function webhookTags(topic: string) {
  if (topic.startsWith('products/') || topic.startsWith('inventory_levels/'))
    return [catalogTags.products, catalogTags.collections];
  if (topic.startsWith('collections/')) return [catalogTags.collections, catalogTags.products];
  if (topic.startsWith('shop/') || topic.startsWith('policies/') || topic.startsWith('menus/')) return ['content:shop'];
  if (topic.startsWith('pages/')) return ['content:pages', 'content:shop'];
  return [];
}

export async function readWebhookBody(request: Request, limit = 1024 * 1024) {
  if (Number(request.headers.get('content-length')) > limit) throw new RangeError('Webhook body too large');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RangeError('Webhook body too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
