import Link from 'next/link';
import { SearchDialog } from '@/components/search/search-dialog';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Icon } from '@/components/ui/icons';
import type { NavigationLink } from '@/lib/utils/storefront-url';

export function Header({ isDemo, name, links }: { isDemo: boolean; name: string; links: NavigationLink[] }) {
  return (
    <header className="site-header">
      <div className="header-left">
        <Link href="/" className="wordmark">
          {name}
          <span className="wordmark-dot">®</span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="header-actions">
        <SearchDialog />
        <Link className="icon-button account-link" href="/account" aria-label="Account">
          <Icon name="user" />
        </Link>
        <CartDrawer isDemo={isDemo} />
      </div>
    </header>
  );
}
