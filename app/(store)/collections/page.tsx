import Link from 'next/link';
import Image from 'next/image';
import { getCollections } from '@/lib/shopify/queries/catalog.server';

export const metadata = { title: 'Collections' };

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <section className="container page-section">
      <div className="page-heading">
        <p className="eyebrow">Find your everyday</p>
        <h1>The collections.</h1>
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
                  sizes="(max-width: 700px) 100vw, 33vw"
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
