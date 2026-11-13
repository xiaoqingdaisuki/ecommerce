'use client';

import { ShopifyScripts } from '@shopify/hydrogen/react';
import type { ShopifyScriptsShop } from '@shopify/hydrogen';
import { useRouter } from 'next/navigation';

/** Native Shopify Inbox and privacy banner; shop configuration is resolved on the server. */
export function ShopifyRuntime({ shop, inbox }: { shop: ShopifyScriptsShop; inbox: boolean }) {
  const router = useRouter();
  return (
    <>
      <ShopifyScripts
        shop={shop}
        i18n={{ country: 'US', language: 'EN' }}
        inbox={inbox}
        consent={{ mode: 'default-banner' }}
        analytics={{ channel: 'headless' }}
        shopifyAnalytics={false}
        webMcp={false}
        navigate={(url) => router.push(url)}
      />
      {inbox ? <shopify-chat suppressHydrationWarning /> : null}
    </>
  );
}
