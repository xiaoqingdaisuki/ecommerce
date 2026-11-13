'use server';

import { cartHandlers } from '@/lib/shopify/cart.server';
import { getRequestClient } from '@/lib/shopify/client';
import { isDemo } from '@/lib/shopify/env';

export async function prepareCheckout() {
  if (isDemo) throw new Error('Checkout requires a real Shopify store.');
  const { data } = await cartHandlers.get({ storefrontClient: await getRequestClient() });
  const cart = data.cart;
  if (!cart?.lines.nodes.length || !cart.checkoutUrl) throw new Error('Your bag is empty.');
  const url = new URL(cart.checkoutUrl);
  if (url.protocol !== 'https:') throw new Error('Invalid checkout URL.');
  return url.toString();
}
