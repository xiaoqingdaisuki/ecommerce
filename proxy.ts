import { createShopifyRouteTemplates, handleShopifyRoutes } from '@shopify/hydrogen';
import { NextResponse, type NextRequest } from 'next/server';
import { createRequestClient } from '@/lib/shopify/client';
import { cartHandlers } from '@/lib/shopify/cart.server';
import { predictiveSearchHandlers } from '@/lib/shopify/search.server';

export const routeTemplates = createShopifyRouteTemplates({});

export function proxy(request: NextRequest) {
  const { client, requestContext } = createRequestClient(request);
  const shopifyRoute = handleShopifyRoutes({
    request,
    requestContext,
    storefrontClient: client,
    routeTemplates,
    handlers: [cartHandlers, predictiveSearchHandlers],
  });
  if (shopifyRoute) return shopifyRoute;

  const requestHeaders = requestContext.getForwardedRequestHeaders();
  requestHeaders.delete('content-security-policy');
  requestHeaders.delete('content-security-policy-report-only');
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  requestContext.applyResponseHeaders(response.headers);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml).*)'],
};
