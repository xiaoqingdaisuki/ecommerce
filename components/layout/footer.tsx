import Link from 'next/link';
import type { NavigationLink } from '@/lib/utils/storefront-url';

export function Footer({ name, links }: { name: string; links: NavigationLink[] }) {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="wordmark">
          {name}
          <span className="wordmark-dot">®</span>
        </Link>
        <p className="muted small">Powered by Shopify. Made for your everyday.</p>
      </div>
      <nav aria-label="Footer navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.title}
          </Link>
        ))}
      </nav>
      <p className="muted small">
        © {new Date().getFullYear()} {name}
      </p>
    </footer>
  );
}
