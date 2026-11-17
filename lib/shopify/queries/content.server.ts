import 'server-only';
import { gql } from '@shopify/hydrogen';
import { cacheLife, cacheTag } from 'next/cache';
import { createCatalogClient } from '@/lib/shopify/client';

const SHOP_QUERY = gql(`
  query ShopContent {
    shop {
      id name description primaryDomain { url }
      privacyPolicy { title body handle }
      refundPolicy { title body handle }
      shippingPolicy { title body handle }
      termsOfService { title body handle }
    }
    page(handle: "home") { title bodySummary }
    mainMenu: menu(handle: "main-menu") { items { title url } }
    footerMenu: menu(handle: "footer") { items { title url } }
    about: page(handle: "about") { title handle }
  }
`);

const PAGE_QUERY = gql(
  `query CmsPage($handle: String!) { page(handle: $handle) { title body bodySummary seo { title description } } }`,
);

export async function getShop() {
  'use cache';
  cacheLife('catalog');
  cacheTag('content:shop');
  const { data, errors } = await createCatalogClient().graphql(SHOP_QUERY);
  if (errors?.length || !data) throw new Error('Store content is temporarily unavailable.');
  return {
    ...data.shop,
    home: data.page,
    mainMenu: data.mainMenu?.items ?? [],
    footerMenu: data.footerMenu?.items ?? [],
    about: data.about,
  };
}

export async function getPage(handle: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag('content:pages');
  const { data, errors } = await createCatalogClient().graphql(PAGE_QUERY, { variables: { handle } });
  if (errors?.length || !data) throw new Error('This page could not be loaded.');
  return data.page;
}
