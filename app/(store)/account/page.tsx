import Link from 'next/link';
import { env, isDemo, storeDomain } from '@/lib/shopify/env';

export const metadata = { title: 'Account', robots: { index: false, follow: false } };
export default function AccountPage() {
  return (
    <section className="store-container narrow page-section account-page">
      <p className="eyebrow">Your account</p>
      <h1>Welcome back.</h1>
      <p className="muted">
        View your orders, manage your addresses, and keep your details up to date with your Shopify account.
      </p>
      {isDemo ? (
        <div className="notice">Customer accounts are available after connecting a real Shopify store.</div>
      ) : (
        <a href={env.SHOPIFY_ACCOUNT_URL ?? `https://${storeDomain}/account`} className="button">
          Continue to Shopify account <span>↗</span>
        </a>
      )}
      <Link href="/collections/all" className="text-link">
        Continue shopping
      </Link>
    </section>
  );
}
