'use client';

import { ShopifyScripts } from '@shopify/hydrogen/react';
import { getShopifyScriptTags, type ShopifyScriptsShop } from '@shopify/hydrogen';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Script from 'next/script';
import { Icon } from '@/components/ui/icons';

/** Native Shopify Inbox and privacy banner; shop configuration is resolved on the server. */
export function ShopifyRuntime({ shop, inbox }: { shop: ShopifyScriptsShop; inbox: boolean }) {
  const router = useRouter();
  const [chatRequested, setChatRequested] = useState(false);
  const [chatError, setChatError] = useState(false);
  const inboxSource = chatRequested
    ? getShopifyScriptTags({ shop, inbox: true, shopifyAnalytics: false }).scripts.find(
        (script) => script.attributes?.id === 'shopify-inbox',
      )?.attributes?.src
    : undefined;
  return (
    <>
      <ShopifyScripts
        shop={shop}
        i18n={{ country: 'US', language: 'EN' }}
        inbox={false}
        consent={{ mode: 'default-banner' }}
        analytics={{ channel: 'headless' }}
        shopifyAnalytics={false}
        webMcp={false}
        navigate={(url) => router.push(url)}
      />
      {inbox && !chatRequested ? (
        <button
          type="button"
          className="chat-launcher"
          aria-label="Open support chat"
          onClick={() => setChatRequested(true)}
        >
          <Icon name="user" width={18} height={18} /> Chat
        </button>
      ) : null}
      {chatRequested ? (
        <>
          <shopify-chat suppressHydrationWarning />
          {typeof inboxSource === 'string' ? (
            <Script
              id="shopify-inbox"
              src={inboxSource}
              type="module"
              strategy="afterInteractive"
              onLoad={() => {
                void customElements
                  .whenDefined('shopify-chat')
                  .then(() => document.querySelector('shopify-chat')?.setAttribute('open', ''));
              }}
              onError={() => setChatError(true)}
            />
          ) : null}
          {chatError ? (
            <a href="/support" className="chat-launcher">
              Chat unavailable · Help center
            </a>
          ) : null}
        </>
      ) : null}
    </>
  );
}
