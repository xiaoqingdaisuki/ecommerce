import type { NextConfig } from 'next';

const config: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Public catalog data is invalidated by signed Shopify webhooks.
    // The default in-memory handler drops entries at revalidate, so a one-minute
    // profile repeatedly blocks visitors on cross-border Storefront API reads.
    catalog: { stale: 60, revalidate: 900, expire: 3600 },
  },
  partialPrefetching: true,
  agentRules: false,
  poweredByHeader: false,
  devIndicators: false,
  // Bound catalog prerender bursts against the upstream Storefront API.
  experimental: { cpus: 2 },
  images: {
    qualities: [70, 75],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }],
  },
};

export default config;
