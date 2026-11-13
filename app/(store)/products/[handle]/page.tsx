import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductPurchase } from '@/components/product/product-purchase';
import { getFeaturedProducts, getProduct } from '@/lib/shopify/queries/catalog.server';
import { env } from '@/lib/shopify/env';
import { serializeJsonLd } from '@/lib/seo/json-ld';

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
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const product = await getProduct(handle);
  if (!product) notFound();
  const price = product.priceRange.minVariantPrice;
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
  return (
    <section className="container product-page">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/collections/all">Shop</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>
      <div className="product-detail-grid">
        <div className="product-gallery">
          {product.images.nodes.map((image, index) => (
            <div className="detail-image" key={image.url}>
              <Image
                src={image.url}
                alt={image.altText ?? product.title}
                fill
                priority={index === 0}
                sizes="(max-width: 850px) 100vw, 55vw"
              />
            </div>
          ))}
        </div>
        <ProductPurchase
          key={product.id}
          product={product}
          initialVariantId={typeof search.variant === 'string' ? search.variant : undefined}
        />
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </section>
  );
}
