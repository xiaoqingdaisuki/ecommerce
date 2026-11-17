import { CartContent } from '@/components/cart/cart-content';
import { isDemo } from '@/lib/shopify/env';
import Link from 'next/link';
import { Suspense } from 'react';
import { Icon } from '@/components/ui/icons';
import { ProductCarousel } from '@/components/product/product-carousel';
import { getFeaturedProducts } from '@/lib/shopify/queries/catalog.server';

export const metadata = { title: 'Your cart', robots: { index: false, follow: false } };
export default function CartPage() {
  return (
    <>
      <section className="cart-page-surface">
        <div className="store-container max-w-[1280px]">
          <h1 className="sr-only">Your cart</h1>
          <CartContent isDemo={isDemo} variant="page" />
        </div>
      </section>
      <div className="cart-recommendations">
        <Suspense fallback={null}>
          <CartRecommendations />
        </Suspense>
      </div>
    </>
  );
}

async function CartRecommendations() {
  try {
    const products = (await getFeaturedProducts()).filter((product) => product.availableForSale);
    return <ProductCarousel products={products} title="YOU MAY ALSO LIKE" eyebrow="" />;
  } catch {
    return (
      <div className="store-container py-10">
        <Link href="/collections/all" className="text-link">
          Explore more products <Icon name="arrow" width={16} />
        </Link>
      </div>
    );
  }
}
