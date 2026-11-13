import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { cartHandlers } from '@/lib/shopify/cart.server';
import { getRequestClient } from '@/lib/shopify/client';
import { env, isDemo, storeDomain } from '@/lib/shopify/env';
import { getShop } from '@/lib/shopify/queries/content.server';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ShopifyRuntime } from '@/components/layout/shopify-runtime';
import { storefrontHref, type NavigationLink } from '@/lib/utils/storefront-url';
import { Providers } from './providers';

export async function AppShell({ children }: { children: ReactNode }) {
  await connection();
  const cartData = getRequestClient().then((storefrontClient) =>
    cartHandlers.get({ storefrontClient }).then(({ data }) => data),
  );
  const shop = await getShop();
  const name = isDemo ? 'Atelier' : shop.name;
  const domains = [storeDomain, new URL(shop.primaryDomain.url).hostname];
  const mapLinks = (items: { title: string; url: string | null }[]): NavigationLink[] =>
    items.flatMap((item) => {
      const href = storefrontHref(item.url, domains);
      return href ? [{ title: item.title, href }] : [];
    });
  const links = shop.mainMenu.length
    ? mapLinks(shop.mainMenu)
    : [
        { title: 'Shop', href: '/collections/all' },
        { title: 'Collections', href: '/collections' },
      ];
  const footerLinks = mapLinks(shop.footerMenu);
  for (const policy of [shop.privacyPolicy, shop.refundPolicy, shop.shippingPolicy, shop.termsOfService]) {
    if (policy && !footerLinks.some((link) => link.href === `/policies/${policy.handle}`))
      footerLinks.push({ title: policy.title, href: `/policies/${policy.handle}` });
  }
  footerLinks.push({ title: 'Account', href: '/account' });
  return (
    <Providers cartData={cartData}>
      <Header isDemo={isDemo} name={name} links={links} />
      <main id="main-content">{children}</main>
      <Footer name={name} links={footerLinks} />
      {!isDemo ? (
        <ShopifyRuntime
          shop={{ shopId: shop.id, storefrontId: env.SHOPIFY_STOREFRONT_ID ?? '0', myshopifyDomain: storeDomain }}
          inbox={env.SHOPIFY_INBOX_ENABLED === 'true'}
        />
      ) : null}
    </Providers>
  );
}
