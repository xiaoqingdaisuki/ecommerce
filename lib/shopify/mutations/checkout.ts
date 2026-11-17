'use server';

import { cartHandlers } from '@/lib/shopify/cart.server';
import { getRequestClient } from '@/lib/shopify/client';
import { isDemo } from '@/lib/shopify/env';
import { gql } from '@shopify/hydrogen';

const BUY_NOW = gql(`
  mutation BuyNow($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { message }
    }
  }
`);

export async function buyNow(merchandiseId: string, quantity: number) {
  if (isDemo) throw new Error('Connect a Shopify store to enable checkout.');
  if (
    !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(merchandiseId) ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  )
    throw new Error('Please select a valid product and quantity.');
  const { data, errors } = await (
    await getRequestClient()
  ).graphql(BUY_NOW, {
    variables: { input: { lines: [{ merchandiseId, quantity }] } },
  });
  if (errors?.length || data?.cartCreate?.userErrors.length || !data?.cartCreate?.cart?.checkoutUrl)
    throw new Error(data?.cartCreate?.userErrors[0]?.message || 'Checkout is temporarily unavailable.');
  const url = new URL(data.cartCreate.cart.checkoutUrl);
  if (url.protocol !== 'https:') throw new Error('Invalid checkout URL.');
  return url.toString();
}

export async function prepareCheckout() {
  if (isDemo) throw new Error('Checkout requires a real Shopify store.');
  const { data } = await cartHandlers.get({ storefrontClient: await getRequestClient() });
  const cart = data.cart;
  if (!cart?.lines.nodes.length || !cart.checkoutUrl) throw new Error('Your bag is empty.');
  const url = new URL(cart.checkoutUrl);
  if (url.protocol !== 'https:') throw new Error('Invalid checkout URL.');
  return url.toString();
}
