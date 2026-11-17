import Image from 'next/image';
import Link from 'next/link';
import { getCollections, getFeaturedProducts } from '@/lib/shopify/queries/catalog.server';
import { Hero } from '@/components/home/hero';
import { ProductCarousel } from '@/components/product/product-carousel';
import { Icon } from '@/components/ui/icons';
import { ServiceStrip } from '@/components/layout/service-strip';
import { Price } from '@/components/product/price';

export default async function HomePage() {
  const [products, collections] = await Promise.all([getFeaturedProducts(), getCollections()]);
  const featured = products.filter((product) => product.availableForSale && product.featuredImage);
  const heroProducts = [...featured].sort(
    (a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount),
  );
  const spotlight = featured[featured.length > 1 ? 1 : 0];
  return (
    <>
      <Hero products={heroProducts} />
      <section className="border-b border-neutral-200 bg-white">
        <nav
          className="store-container grid grid-cols-2 gap-4 py-7 lg:grid-cols-4 lg:gap-8 lg:py-9"
          aria-label="Shop by collection"
        >
          <Link href="/collections/all" className="category-shortcut">
            <span className="category-icon">
              <Icon name="grid" />
            </span>
            <span>
              <strong>All products</strong>
              <span>Discover the collection</span>
            </span>
            <Icon name="chevron" width={15} />
          </Link>
          {collections.slice(0, 3).map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="category-shortcut"
            >
              <span className="category-icon">
                {collection.image ? (
                  <Image
                    src={collection.image.url}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 object-contain"
                  />
                ) : (
                  <Icon name="mountain" />
                )}
              </span>
              <span>
                <strong>{collection.title}</strong>
                <span>Find your favorite</span>
              </span>
              <Icon name="chevron" width={15} />
            </Link>
          ))}
        </nav>
      </section>
      <div className="bg-[#f7f8f8]">
        <ProductCarousel
          title="Meet your next favorite."
          eyebrow="The collection, considered"
          products={[...products].sort(
            (a, b) =>
              Number(b.availableForSale && !!b.featuredImage) -
              Number(a.availableForSale && !!a.featuredImage),
          )}
        />
      </div>
      {spotlight ? (
        <section className="store-container pb-16 lg:pb-24">
          <div className="spotlight-grid">
            <div className="flex flex-col items-start justify-center bg-[#191f20] p-8 text-white lg:p-14">
              <p className="eyebrow text-emerald-400">Worth a closer look</p>
              <h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.06] tracking-[-.045em] lg:text-6xl">
                Good design.
                <br />
                Great possibilities.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-400">
                From your first look to your next adventure. Explore the details and make it yours.
              </p>
              <Link href={`/products/${spotlight.handle}`} className="button mt-8">
                Discover more <Icon name="arrow" width={17} />
              </Link>
            </div>
            <div className="flex min-w-0 flex-col bg-[#eaf0ee] p-7 lg:p-10">
              <div className="relative flex min-h-[280px] flex-1 items-center justify-center lg:min-h-[340px]">
                <ProductBadges
                  availableForSale={spotlight.availableForSale}
                  price={
                    spotlight.selectedOrFirstAvailableVariant?.price ?? spotlight.priceRange.minVariantPrice
                  }
                  compareAt={spotlight.selectedOrFirstAvailableVariant?.compareAtPrice}
                />
                {spotlight.featuredImage ? (
                  <Image
                    src={spotlight.featuredImage.url}
                    alt={spotlight.featuredImage.altText ?? spotlight.title}
                    fill
                    sizes="(max-width: 1023px) 90vw, 45vw"
                    className="object-contain p-4 mix-blend-multiply"
                  />
                ) : null}
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs text-neutral-500">{spotlight.productType || spotlight.vendor}</p>
                  <h3 className="mb-3 text-xl font-semibold tracking-tight">{spotlight.title}</h3>
                  <Price
                    price={
                      spotlight.selectedOrFirstAvailableVariant?.price ?? spotlight.priceRange.minVariantPrice
                    }
                    compareAt={spotlight.selectedOrFirstAvailableVariant?.compareAtPrice}
                  />
                </div>
                <Link
                  href={`/products/${spotlight.handle}`}
                  className="round-button shrink-0 bg-white"
                  aria-label={`Explore ${spotlight.title}`}
                >
                  <Icon name="arrow" width={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <section className="store-container pb-16 lg:pb-24">
        <div className="section-heading mb-7">
          <div>
            <p className="eyebrow mb-3 text-emerald-700">Find your direction</p>
            <h2>Different paths. Same curiosity.</h2>
          </div>
          <Link href="/collections" className="text-link hidden lg:flex">
            All collections <Icon name="arrow" width={16} />
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {collections.slice(0, 3).map((collection, index) => (
            <Link
              href={`/collections/${collection.handle}`}
              key={collection.id}
              className="collection-feature group"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow text-neutral-500">
                  Collection / {String(index + 1).padStart(2, '0')}
                </span>
                <Icon name="arrow" width={20} />
              </div>
              <div className="relative flex aspect-[1.6] items-center justify-center">
                {collection.image ? (
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText ?? collection.title}
                    fill
                    sizes="(max-width: 1023px) 90vw, 30vw"
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Icon
                    name={index === 0 ? 'mountain' : index === 1 ? 'grid' : 'bag'}
                    width={76}
                    height={76}
                    strokeWidth={0.6}
                    className="text-neutral-400"
                  />
                )}
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{collection.title}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-6 text-neutral-500">
                {collection.description || 'A different way to discover something you’ll love.'}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-[#e8efec]">
        <div className="store-container flex flex-col items-start justify-between gap-8 py-12 lg:flex-row lg:items-center lg:py-16">
          <div>
            <p className="eyebrow text-emerald-800">A little guidance goes a long way</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              Great things start with a question.
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              Find answers about delivery, payments and shopping with us.
            </p>
          </div>
          <Link href="/support" className="button button-dark shrink-0">
            Visit the help center <Icon name="arrow" width={17} />
          </Link>
        </div>
      </section>
      <ServiceStrip />
    </>
  );
}
import { ProductBadges } from '@/components/product/product-badges';
