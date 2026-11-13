/** Keep internal Shopify CMS links on the headless storefront. */
export function storefrontHref(href: string | null, shopDomains: string[]) {
  if (!href) return undefined;
  if (href.startsWith('/') && !href.startsWith('//')) return href === '/collections/all' ? '/search' : href;
  try {
    const url = new URL(href);
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') return url.toString();
    if (url.protocol !== 'https:') return undefined;
    if (!shopDomains.includes(url.hostname)) return url.toString();
    if (url.pathname === '/pages/data-sharing-opt-out') return url.toString();
    const path = url.pathname === '/collections/all' ? '/search' : url.pathname;
    return `${path}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export type NavigationLink = { title: string; href: string };
