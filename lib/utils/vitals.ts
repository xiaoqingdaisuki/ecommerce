export const VITAL_NAMES = ['TTFB', 'FCP', 'LCP', 'CLS', 'INP'] as const;
export type VitalReport = {
  name: (typeof VITAL_NAMES)[number];
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  route: string;
  device: 'mobile' | 'desktop';
};

/** Send route templates, never product handles, query strings, or customer identifiers. */
export function metricRoute(pathname: string) {
  if (pathname.startsWith('/collections/') && pathname.includes('/products/')) return '/products/[handle]';
  for (const prefix of ['/products/', '/collections/', '/pages/', '/policies/', '/blogs/'])
    if (pathname.startsWith(prefix)) return `${prefix}[handle]`;
  return ['/', '/collections', '/search', '/cart', '/account', '/support'].includes(pathname)
    ? pathname
    : '/other';
}

export function validVital(value: unknown): value is VitalReport {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    VITAL_NAMES.includes(item.name as VitalReport['name']) &&
    typeof item.value === 'number' &&
    Number.isFinite(item.value) &&
    item.value >= 0 &&
    item.value <= (item.name === 'CLS' ? 100 : 600_000) &&
    ['good', 'needs-improvement', 'poor'].includes(String(item.rating)) &&
    typeof item.route === 'string' &&
    item.route === metricRoute(item.route) &&
    ['mobile', 'desktop'].includes(String(item.device))
  );
}
