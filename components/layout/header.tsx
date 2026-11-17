import Link from 'next/link';
import { SearchDialog } from '@/components/search/search-dialog';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Icon } from '@/components/ui/icons';
import { MobileMenu } from './mobile-menu';
import type { NavigationLink } from '@/lib/utils/storefront-url';
import { STORE_NAVIGATION } from '@/lib/utils/navigation';

export function Header({
  isDemo,
  name,
  links,
  collections,
}: {
  isDemo: boolean;
  name: string;
  links: NavigationLink[];
  collections: NavigationLink[];
}) {
  return (
    <>
      <div className="announcement">
        <div className="store-container flex items-center justify-between gap-4">
          <span className="hidden text-xs lg:flex">Thoughtfully selected. Ready for what’s next.</span>
          <Link
            href="/collections/all"
            className="flex flex-1 items-center justify-center gap-3 text-xs font-medium"
          >
            Your next adventure starts here <Icon name="arrow" width={15} height={15} />
          </Link>
          <span className="hidden items-center gap-2 text-xs lg:flex">
            <Icon name="globe" width={15} height={15} /> US · English · USD
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="store-container flex min-h-[76px] items-center justify-between gap-4 lg:gap-8">
          <div className="flex min-w-0 items-center gap-2 lg:gap-10">
            <MobileMenu name={name} links={[...collections, ...links]} />
            <Link href="/" className="wordmark">
              <span className="brand-symbol" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
              <span className="truncate">
                {name}
                <span className="text-emerald-600">.</span>
              </span>
            </Link>
          </div>
          <nav
            aria-label="Main navigation"
            className="hidden shrink-0 items-center gap-5 whitespace-nowrap text-[13px] font-medium lg:flex"
          >
            {STORE_NAVIGATION.map((link) =>
              link.href !== '/collections' ? (
                <Link key={link.href} href={link.href} className="main-nav-link">
                  {link.title}
                </Link>
              ) : (
                <div key={link.href} className="nav-group">
                  <Link href={link.href} className="main-nav-link">
                    {link.title} <Icon name="chevron" className="rotate-90" width={12} height={12} />
                  </Link>
                  <div className="mega-menu">
                    <div className="store-container grid grid-cols-[1fr_2fr] gap-12 py-9">
                      <div className="flex flex-col items-start">
                        <p className="eyebrow text-emerald-700">Discover more</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                          Find your next favorite.
                        </h2>
                        <Link href="/collections/all" className="text-link mt-6">
                          Explore all products <Icon name="arrow" width={16} />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 content-start gap-x-5 gap-y-1">
                        {[...collections, ...links]
                          .filter(
                            (link, index, all) => all.findIndex((item) => item.href === link.href) === index,
                          )
                          .map((link) => (
                            <Link key={link.href} href={link.href} className="mega-link">
                              {link.title}
                              <Icon name="arrow" width={16} />
                            </Link>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </nav>
          <div className="flex shrink-0 items-center gap-0 lg:gap-2">
            <SearchDialog />
            <Link className="icon-button hidden lg:flex" href="/account" aria-label="Account">
              <Icon name="user" />
            </Link>
            <CartDrawer isDemo={isDemo} />
          </div>
        </div>
      </header>
    </>
  );
}
