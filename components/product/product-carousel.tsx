import type { ProductCard as ProductCardData } from '@/lib/shopify/queries/catalog';
import { ProductCard } from './product-card';
import { ProgressiveSwiper } from '@/components/ui/progressive-swiper';

export function ProductCarousel({
  products,
  title,
  eyebrow = 'Selected for you',
  href = '/collections/all',
}: {
  products: ProductCardData[];
  title: string;
  eyebrow?: string;
  href?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="store-container section-space deferred-section" aria-label={title}>
      <ProgressiveSwiper mode="products" count={products.length} title={title} eyebrow={eyebrow} href={href}>
        {products.map((product) => (
          <div className="swiper-slide" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </ProgressiveSwiper>
    </section>
  );
}
