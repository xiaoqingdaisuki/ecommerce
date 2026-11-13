import type { NextConfig } from 'next';

const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }],
  },
};

export default config;
