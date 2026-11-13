import { revalidateTag } from 'next/cache';
import { env, storeDomain } from '@/lib/shopify/env';
import { readWebhookBody, verifyWebhook, webhookTags } from '@/lib/shopify/webhook';

export async function POST(request: Request) {
  if (!env.SHOPIFY_WEBHOOK_SECRET) return Response.json({ error: 'Webhook is not configured' }, { status: 503 });
  let body: Uint8Array;
  try {
    body = await readWebhookBody(request);
  } catch (error) {
    if (error instanceof RangeError) return Response.json({ error: 'Payload too large' }, { status: 413 });
    throw error;
  }
  if (!verifyWebhook(body, request.headers.get('x-shopify-hmac-sha256'), env.SHOPIFY_WEBHOOK_SECRET))
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  if (request.headers.get('x-shopify-shop-domain') !== storeDomain)
    return Response.json({ error: 'Unknown shop' }, { status: 403 });
  const topic = request.headers.get('x-shopify-topic');
  if (!topic) return Response.json({ error: 'Missing topic' }, { status: 400 });
  try {
    JSON.parse(Buffer.from(body).toString('utf8'));
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const tags = webhookTags(topic);
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  // Cache invalidation is idempotent; Shopify retries are safe without a database.
  return Response.json({ ok: true, tags });
}
