import Image from 'next/image';
import Link from 'next/link';
import { ProgressiveSwiper } from '@/components/ui/progressive-swiper';
import type { ProductCard } from '@/lib/shopify/queries/catalog';
import { Icon } from '@/components/ui/icons';
import { ProductBadges } from '@/components/product/product-badges';
import { formatPrice } from '@/lib/utils/money';

const stories = [
  {
    eyebrow: 'A new perspective',
    title: (
      <>
        Made for
        <br />
        what’s next.
      </>
    ),
    body: 'Fresh possibilities. Considered design. Find the gear that moves you forward.',
  },
  {
    eyebrow: 'Find your own line',
    title: (
      <>
        Go beyond
        <br />
        the everyday.
      </>
    ),
    body: 'A closer look at the details that make the difference. Discover your next favorite.',
  },
  {
    eyebrow: 'Your next chapter',
    title: (
      <>
        Less ordinary.
        <br />
        More you.
      </>
    ),
    body: 'Explore the collection. Choose your setup. Make every moment your own.',
  },
];

export function Hero({ products }: { products: ProductCard[] }) {
  if (!products.length)
    return (
      <section className="store-container section-space">
        <h1 className="text-5xl font-semibold tracking-tight">Discover what’s next.</h1>
        <Link href="/collections/all" className="button mt-6">
          Shop the collection <Icon name="arrow" />
        </Link>
      </section>
    );
  return (
    <section aria-label="Featured collection" className="hero-shell">
      <ProgressiveSwiper mode="hero" count={Math.min(products.length, 3)}>
        {products.slice(0, 3).map((product, index) => (
          <div className="swiper-slide" key={product.id}>
            <div className={`hero-slide hero-tone-${index}`}>
              <div className="store-container grid min-w-0 items-center gap-5 py-10 lg:min-h-[580px] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:py-9">
                <div className="flex min-w-0 flex-col items-start">
                  <p className="eyebrow flex items-center gap-2 text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    {stories[index].eyebrow}
                  </p>
                  <HeroHeading primary={index === 0}>{stories[index].title}</HeroHeading>
                  <p className="mt-5 max-w-[310px] text-sm leading-6 text-neutral-600">
                    {stories[index].body}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-6">
                    <Link href={`/products/${product.handle}`} className="button">
                      Explore product <Icon name="arrow" width={17} />
                    </Link>
                    <Link href="/collections/all" className="text-link">
                      Shop all <Icon name="arrow" width={16} />
                    </Link>
                  </div>
                  <p className="mt-8 flex flex-wrap gap-x-3 text-xs text-neutral-600">
                    <span className="font-semibold text-neutral-800">{product.title}</span>
                    <span>From {formatPrice(product.priceRange.minVariantPrice)}</span>
                  </p>
                </div>
                <div className="hero-product relative flex aspect-[1.2] min-w-0 items-center justify-center lg:aspect-square">
                  <ProductBadges
                    availableForSale={product.availableForSale}
                    price={product.priceRange.minVariantPrice}
                    compareAt={product.compareAtPriceRange.minVariantPrice}
                  />
                  {product.featuredImage ? (
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText ?? product.title}
                      fill
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'low'}
                      quality={70}
                      sizes="(max-width: 1023px) calc(100vw - 40px), (min-width: 1496px) 690px, 48vw"
                      className="object-contain p-3 mix-blend-multiply lg:p-6"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </ProgressiveSwiper>
    </section>
  );
}

function HeroHeading({ primary, children }: { primary: boolean; children: React.ReactNode }) {
  const Heading = primary ? 'h1' : 'h2';
  return (
    <Heading className="mt-5 text-[48px] font-semibold leading-[1.02] tracking-[-.055em] lg:mt-6 lg:text-[clamp(64px,6.4vw,100px)]">
      {children}
    </Heading>
  );
}
