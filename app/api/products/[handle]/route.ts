import { getProduct } from '@/lib/shopify/queries/catalog.server';

export async function GET(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (!/^[\p{L}\p{N}_-]{1,255}$/u.test(handle))
    return Response.json({ error: 'Invalid product' }, { status: 400 });
  try {
    const product = await getProduct(handle);
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    const { descriptionHtml: _html, seo: _seo, ...purchaseProduct } = product;
    return Response.json(purchaseProduct);
  } catch {
    return Response.json({ error: 'Unable to load this product. Please try again.' }, { status: 503 });
  }
}
