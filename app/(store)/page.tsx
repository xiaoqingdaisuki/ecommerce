import Link from 'next/link';
import { ProductGrid } from '@/components/collection/product-grid';
import { getCollections, getFeaturedProducts } from '@/lib/shopify/queries/catalog.server';
import { getShop } from '@/lib/shopify/queries/content.server';
import { isDemo } from '@/lib/shopify/env';

export default async function HomePage() {
  const [products, collections, shop] = await Promise.all([getFeaturedProducts(), getCollections(), getShop()]);
  return (
    <>
      <section className="home-hero container">
        <span className="eyebrow">The everyday collection / 001</span>
        <h1>
          {isDemo ? (
            <>
              Less, but
              <br />
              <em>better.</em>
            </>
          ) : (
            (shop.home?.title ?? shop.name)
          )}
        </h1>
        <p>
          {isDemo
            ? 'Thoughtfully chosen. Effortlessly worn. Essentials for wherever the day takes you.'
            : shop.home?.bodySummary || shop.description}
        </p>
        <Link className="text-link hero-link" href="/collections/all">
          Discover the collection <span>↗</span>
        </Link>
      </section>
      <section className="container catalog-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Good things, on repeat</p>
            <h2>Everyday essentials</h2>
          </div>
          <Link className="text-link" href="/collections/all">
            Shop all <span>↗</span>
          </Link>
        </div>
        <div className="collection-tabs">
          <Link href="/collections/all" className="active">
            All essentials
          </Link>
          {collections.map((collection) => (
            <Link href={`/collections/${collection.handle}`} key={collection.id}>
              {collection.title}
            </Link>
          ))}
        </div>
        <ProductGrid products={products} />
      </section>
      <section className="closing-note container">
        <p className="eyebrow">Wear it your way.</p>
        <h2>
          A little less noise.
          <br />A little more you.
        </h2>
        <Link href="/collections" className="text-link">
          Explore collections <span>↗</span>
        </Link>
      </section>
    </>
  );
}
