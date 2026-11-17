import type { MetadataRoute } from 'next';
import { getCollections } from '@/lib/shopify/queries/catalog.server';
import { createCatalogClient } from '@/lib/shopify/client';
import { CMS_SITEMAP_QUERY, SITEMAP_QUERY } from '@/lib/shopify/queries/pages';
import { getShop } from '@/lib/shopify/queries/content.server';
import { env } from '@/lib/shopify/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = env.SITE_ORIGIN;
  const entries: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: 'daily' },
    { url: `${origin}/collections`, changeFrequency: 'weekly' },
    { url: `${origin}/collections/all`, changeFrequency: 'daily' },
    { url: `${origin}/support`, changeFrequency: 'monthly' },
  ];
  const collections = await getCollections();
  entries.push(
    ...collections
      .filter(({ handle }) => handle !== 'all')
      .map(({ handle }) => ({ url: `${origin}/collections/${handle}` })),
  );
  const client = createCatalogClient();
  let after: string | undefined;
  // The starter deliberately fails above the single-sitemap limit instead of silently truncating.
  do {
    const { data, errors } = await client.graphql(SITEMAP_QUERY, { variables: { after } });
    if (!data || errors?.length) throw new Error('Sitemap data unavailable');
    entries.push(
      ...data.products.nodes.map((product) => ({
        url: `${origin}/products/${product.handle}`,
        lastModified: product.updatedAt,
      })),
    );
    after = data.products.pageInfo.hasNextPage ? (data.products.pageInfo.endCursor ?? undefined) : undefined;
    if (entries.length > 49_000)
      throw new Error('Large catalog requires partitioned sitemaps using generateSitemaps');
  } while (after);
  do {
    const { data, errors } = await client.graphql(CMS_SITEMAP_QUERY, { variables: { after } });
    if (!data || errors?.length) throw new Error('CMS sitemap data unavailable');
    entries.push(
      ...data.pages.nodes
        .filter((page) => page.handle !== 'home')
        .map((page) => ({ url: `${origin}/pages/${page.handle}`, lastModified: page.updatedAt })),
    );
    after = data.pages.pageInfo.hasNextPage ? (data.pages.pageInfo.endCursor ?? undefined) : undefined;
    if (entries.length > 49_000)
      throw new Error('Large catalog requires partitioned sitemaps using generateSitemaps');
  } while (after);
  const shop = await getShop();
  for (const policy of [shop.privacyPolicy, shop.refundPolicy, shop.shippingPolicy, shop.termsOfService]) {
    if (policy) entries.push({ url: `${origin}/policies/${policy.handle}` });
  }
  return entries;
}
