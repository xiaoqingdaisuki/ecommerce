import Link from 'next/link';
import { Icon } from '@/components/ui/icons';
import type { NavigationLink } from '@/lib/utils/storefront-url';
import { cacheLife } from 'next/cache';

export async function Footer({ name, links }: { name: string; links: NavigationLink[] }) {
  'use cache';
  cacheLife('days');
  const groups = [
    {
      title: 'Discover',
      links: [
        { title: 'All products', href: '/collections/all' },
        { title: 'Collections', href: '/collections' },
        { title: 'Search the store', href: '/search' },
      ],
    },
    {
      title: 'Here to help',
      links: [
        { title: 'Help center', href: '/support' },
        { title: 'Shipping & delivery', href: '/support#delivery' },
        { title: 'Returns & refunds', href: '/support#returns' },
        { title: 'Payment help', href: '/support#payment' },
      ],
    },
    {
      title: 'Your store',
      links: [
        { title: 'My account', href: '/account' },
        { title: 'Shopping cart', href: '/cart' },
        ...links.filter((link) => !['/account', '/search'].includes(link.href)),
      ],
    },
  ];
  return (
    <footer className="site-footer">
      <div className="store-container">
        <div className="grid gap-10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-16">
          <div>
            <Link href="/" className="wordmark text-white">
              {name}
              <span className="text-emerald-400">.</span>
            </Link>
            <p className="mt-4 max-w-56 text-sm leading-7 text-neutral-400">
              A little curiosity.
              <br />A world of possibilities.
            </p>
            <Link href="/collections/all" className="mt-6 flex items-center gap-2 text-xs text-emerald-400">
              Find what moves you <Icon name="arrow" width={16} />
            </Link>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-5 text-sm font-semibold">{group.title}</h2>
              <nav className="flex flex-col gap-3 text-xs text-neutral-400" aria-label={group.title}>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.title}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-5 border-t border-white/10 pt-7 text-[11px] text-neutral-400 lg:flex-row lg:items-center">
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <a
            href="https://github.com/xiaoqingdaisuki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center gap-2 transition-colors hover:text-white"
            aria-label="Author: xiaoqingdaisuki on GitHub (opens in a new tab)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.77-.244.77-.542 0-.267-.01-1.155-.015-2.096-3.13.68-3.79-1.328-3.79-1.328-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.636 1.225 3.28.937.102-.728.393-1.225.715-1.507-2.498-.284-5.124-1.25-5.124-5.56 0-1.228.44-2.232 1.16-3.02-.117-.284-.503-1.43.11-2.98 0 0 .945-.302 3.095 1.153a10.8 10.8 0 0 1 5.625 0c2.148-1.455 3.09-1.153 3.09-1.153.615 1.55.23 2.696.113 2.98.722.788 1.158 1.792 1.158 3.02 0 4.322-2.63 5.273-5.136 5.552.404.35.764 1.042.764 2.1 0 1.517-.014 2.74-.014 3.113 0 .3.203.65.774.54A11.25 11.25 0 0 0 12 .75Z" />
            </svg>
            <span>Built by xiaoqingdaisuki</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
