import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ProductExperience } from '@/components/product/product-experience';
import { getFeaturedProducts, getProduct, getRecommendations } from '@/lib/shopify/queries/catalog.server';
import { ProductCarousel } from '@/components/product/product-carousel';
import { CmsContent } from '@/components/layout/cms-content';
import { ServiceStrip } from '@/components/layout/service-strip';
import { Icon } from '@/components/ui/icons';
import { env } from '@/lib/shopify/env';
import { serializeJsonLd } from '@/lib/seo/json-ld';
import { ProductDetailSkeleton } from '@/components/ui/skeletons';
import type { PurchaseProduct } from '@/lib/shopify/queries/catalog';

export async function generateStaticParams() {
  return (await getFeaturedProducts()).map(({ handle }) => ({ handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const product = await getProduct((await params).handle);
  if (!product) notFound();
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: { title: product.title, images: product.featuredImage ? [product.featuredImage.url] : [] },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();
  const price = product.priceRange.minVariantPrice;
  const { descriptionHtml: _html, seo: _seo, ...purchaseProduct } = product;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((image) => image.url),
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: price.amount,
      priceCurrency: price.currencyCode,
      availability: `https://schema.org/${product.availableForSale ? 'InStock' : 'OutOfStock'}`,
      url: `${env.SITE_ORIGIN}/products/${product.handle}`,
    },
  };
  const detailImage = product.images.nodes[1] ?? product.featuredImage;
  const optionSpecs = (product.variants.nodes[0]?.selectedOptions ?? [])
    .filter((option) => option.value !== 'Default Title')
    .map((option) => [
      option.name,
      [
        ...new Set(
          product.variants.nodes.flatMap((variant) =>
            variant.selectedOptions.filter((item) => item.name === option.name).map((item) => item.value),
          ),
        ),
      ].join(' / '),
    ]);
  return (
    <div className="product-page">
      <section className="store-container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/collections/all">Shop</Link>
          <span>/</span>
          <span>{product.title}</span>
        </div>
        <Suspense fallback={<ProductDetailSkeleton />}>
          <SelectedProduct product={purchaseProduct} searchParams={searchParams} />
        </Suspense>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      </section>
      <nav className="product-section-nav" aria-label="Product information">
        <div className="store-container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-xs font-medium">
          <a href="#overview">Overview</a>
          <a href="#specifications">Product details</a>
          <a href="#product-faq">FAQ</a>
          <a href="#recommended">You may also like</a>
        </div>
      </nav>
      <section id="overview" className="scroll-mt-40 bg-[#1c2324] text-white">
        <div className="store-container grid min-h-[85svh] items-center gap-8 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <p className="eyebrow text-emerald-400">A closer look</p>
            <h2 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-.045em] lg:text-7xl">
              Every detail.
              <br />
              Every possibility.
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-neutral-300">{product.title}</p>
            <a href="#specifications" className="text-link mt-8 text-white">
              Explore the details <Icon name="arrow" width={17} />
            </a>
          </div>
          <div className="relative flex aspect-square min-w-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e8eeed]">
            {detailImage ? (
              <Image
                src={detailImage.url}
                alt={detailImage.altText ?? product.title}
                fill
                sizes="(max-width: 1023px) 90vw, 50vw"
                className="object-contain p-8 mix-blend-multiply lg:p-12"
              />
            ) : (
              <Icon name="mountain" width={120} height={120} className="text-neutral-500" />
            )}
          </div>
        </div>
      </section>
      <section id="specifications" className="store-container section-space scroll-mt-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <p className="eyebrow text-emerald-700">Get to know your setup</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">
              The details make
              <br />
              the difference.
            </h2>
            <div className="prose mt-7 text-sm text-neutral-600">
              {product.descriptionHtml ? (
                <CmsContent html={product.descriptionHtml} />
              ) : (
                <p>
                  Choose from the available options above. Current prices and availability are updated
                  directly from our store.
                </p>
              )}
            </div>
          </div>
          <dl className="specifications">
            {[
              ['Product', product.title],
              ['Brand', product.vendor],
              ['Type', product.productType || 'General'],
              ['Availability', product.availableForSale ? 'Available to order' : 'Currently sold out'],
              ...optionSpecs,
            ].map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section id="product-faq" className="scroll-mt-32 bg-[#f4f6f5]">
        <div className="store-container grid gap-8 py-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20 lg:py-20">
          <div>
            <p className="eyebrow text-emerald-700">Good to know</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">A few more answers.</h2>
          </div>
          <div className="product-details">
            <details>
              <summary>
                How do I choose an option?
                <Icon name="chevron" className="disclosure-chevron" width={17} />
              </summary>
              <p>
                Select the options in the purchase panel. Price and availability update for your selection.
                Sold-out options cannot be added to your cart.
              </p>
            </details>
            <details>
              <summary>
                Where can I find shipping information?
                <Icon name="chevron" className="disclosure-chevron" width={17} />
              </summary>
              <p>
                Delivery availability and shipping costs are confirmed at checkout. Visit our{' '}
                <Link href="/support#delivery">help center</Link> for published shipping information.
              </p>
            </details>
            <details>
              <summary>
                Can I return my purchase?
                <Icon name="chevron" className="disclosure-chevron" width={17} />
              </summary>
              <p>
                Return eligibility depends on the store’s policy and your order. See{' '}
                <Link href="/support#returns">returns information</Link> before ordering.
              </p>
            </details>
          </div>
        </div>
      </section>
      <div id="recommended" className="scroll-mt-32">
        <Suspense fallback={<div className="store-container section-space skeleton h-96" />}>
          <Recommendations productId={product.id} />
        </Suspense>
      </div>
      <ServiceStrip />
    </div>
  );
}

async function Recommendations({ productId }: { productId: string }) {
  return (
    <ProductCarousel
      title="Better together."
      eyebrow="You may also like"
      products={await getRecommendations(productId)}
    />
  );
}

async function SelectedProduct({
  product,
  searchParams,
}: {
  product: PurchaseProduct;
  searchParams: Promise<{ variant?: string }>;
}) {
  const search = await searchParams;
  return (
    <ProductExperience
      key={`${product.id}:${search.variant ?? ''}`}
      product={product}
      initialVariantId={typeof search.variant === 'string' ? search.variant : undefined}
    />
  );
}
