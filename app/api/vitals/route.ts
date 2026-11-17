import { validVital } from '@/lib/utils/vitals';

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return new Response(null, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return new Response(null, { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2048) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      chunks.push(value);
    }
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!validVital(value)) return new Response(null, { status: 400 });
    // A single structured record can be aggregated by the hosting provider's log/metrics sink.
    console.info(
      JSON.stringify({
        event: 'storefront.web-vital',
        name: value.name,
        value: value.value,
        rating: value.rating,
        route: value.route,
        device: value.device,
      }),
    );
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(null, { status: 400 });
  } finally {
    reader.releaseLock();
  }
}
