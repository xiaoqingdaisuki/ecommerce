import { CartContent } from '@/components/cart/cart-content';
import { isDemo } from '@/lib/shopify/env';

export const metadata = { title: 'Your bag', robots: { index: false, follow: false } };
export default function CartPage() {
  return (
    <section className="container narrow page-section">
      <div className="page-heading">
        <p className="eyebrow">Your selection</p>
        <h1>The good stuff.</h1>
      </div>
      <CartContent isDemo={isDemo} />
    </section>
  );
}
