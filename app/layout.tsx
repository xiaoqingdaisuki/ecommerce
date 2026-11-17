import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { env, isDemo } from '@/lib/shopify/env';
import { AppShell } from './app-shell';
import { getShop } from '@/lib/shopify/queries/content.server';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const shop = await getShop();
  const name = isDemo ? 'Atelier' : shop.name;
  const noIndex = isDemo || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production');
  return {
    metadataBase: new URL(env.SITE_ORIGIN),
    title: { default: `${name} — Made for what’s next`, template: `%s | ${name}` },
    description: shop.description || 'Discover our latest collection.',
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
