import Link from 'next/link';
import Image from 'next/image';
import { getCollections } from '@/lib/shopify/queries/catalog.server';

export const metadata = { title: 'Collections' };

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <section className="store-container page-section">
      <div className="page-heading">
        <p className="eyebrow">Find your direction</p>
        <h1>Something for your next chapter.</h1>
        <p className="muted">Explore our collections, one possibility at a time.</p>
      </div>
      <div className="collections-grid">
        {collections.map((collection, index) => (
          <Link href={`/collections/${collection.handle}`} key={collection.id} className="collection-card">
            <div className="collection-image">
              {collection.image ? (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText ?? collection.title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 33vw"
                />
              ) : (
                <span className="collection-monogram">{String(index + 1).padStart(2, '0')}</span>
              )}
            </div>
            <div className="section-heading">
              <h2>{collection.title}</h2>
              <span>↗</span>
            </div>
            <p className="muted">{collection.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
