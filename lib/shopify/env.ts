import 'server-only';
import { z } from 'zod';

const optionalString = z.preprocess((value) => (value === '' ? undefined : value), z.string().optional());
const schema = z.object({
  SHOPIFY_STORE_DOMAIN: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z
      .string()
      .regex(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i, 'Use a hostname without https:// or a path')
      .optional(),
  ),
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: optionalString,
  SHOPIFY_API_VERSION: z
    .string()
    .regex(/^\d{4}-(01|04|07|10)$/)
    .default('2026-10'),
  SITE_ORIGIN: z.url().default('http://localhost:3000'),
  SHOPIFY_WEBHOOK_SECRET: optionalString,
  SHOPIFY_INBOX_ENABLED: z.enum(['true', 'false']).default('false'),
  SHOPIFY_STOREFRONT_ID: optionalString,
  SHOPIFY_ACCOUNT_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
});

export const env = schema.parse(process.env);
export const isDemo = !env.SHOPIFY_STORE_DOMAIN || env.SHOPIFY_STORE_DOMAIN.endsWith('mock.shop');
export const storeDomain = env.SHOPIFY_STORE_DOMAIN ?? 'mock.shop';

if (!isDemo && !env.SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error(
    'A real store requires SHOPIFY_STOREFRONT_ACCESS_TOKEN. Use a public Storefront API token.',
  );
}

if (process.env.VERCEL_ENV === 'production') {
  if (isDemo) throw new Error('Production requires a real Shopify store.');
  if (!env.SITE_ORIGIN.startsWith('https://')) throw new Error('Production SITE_ORIGIN must use HTTPS.');
  if (!env.SHOPIFY_WEBHOOK_SECRET) throw new Error('Production requires SHOPIFY_WEBHOOK_SECRET.');
}
