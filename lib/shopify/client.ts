import 'server-only';
import { createShopifyRequestContext, createStorefrontClient } from '@shopify/hydrogen';
import { headers } from 'next/headers';
import { cache } from 'react';
import { env, storeDomain } from '@/lib/shopify/env';
import { i18n } from './i18n';

export function createRequestClient(request: Request | { headers: Headers }) {
  const requestContext = createShopifyRequestContext({ request, i18n });
  const client = createStorefrontClient({
    type: 'public',
    requestContext,
    config: {
      storeDomain,
      publicStorefrontToken: env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      apiVersion: env.SHOPIFY_API_VERSION,
      defaultTimeoutInMs: 12_000,
    },
  });
  return { client, requestContext };
}

export const getRequestClient = cache(async () => {
  return createRequestClient({ headers: new Headers(await headers()) }).client;
});

/** Public catalog reads deliberately have no shopper cookies or session context. */
export function createCatalogClient() {
  // A static catalog context has no request ID; avoid Hydrogen's random UUID fallback.
  return createRequestClient({ headers: new Headers({ 'x-request-id': '' }) }).client;
}
