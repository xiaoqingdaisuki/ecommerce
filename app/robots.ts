import type { MetadataRoute } from 'next';
import { env, isDemo } from '@/lib/shopify/env';

export default function robots(): MetadataRoute.Robots {
  const noIndex = isDemo || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production');
  return {
    rules: noIndex
      ? { userAgent: '*', disallow: '/' }
      : { userAgent: '*', allow: '/', disallow: ['/cart', '/account', '/api/', '/search?'] },
    sitemap: `${env.SITE_ORIGIN}/sitemap.xml`,
  };
}
