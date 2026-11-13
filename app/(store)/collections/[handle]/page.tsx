import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ProductGrid } from '@/components/collection/product-grid';
import { getCollection, getCollections } from '@/lib/shopify/queries/catalog.server';

export async function generateStaticParams() {
  return (await getCollections()).map(({ handle }) => ({ handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = (await getCollections()).find((item) => item.handle === handle);
  return {
    title: collection?.title ?? 'Collection',
    description: collection?.description,
    alternates: { canonical: `/collections/${handle}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ after?: string }>;
}) {
  await connection();
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const collection = await getCollection(handle, typeof search.after === 'string' ? search.after : undefined);
  if (!collection) notFound();
  return (
    <section className="container page-section">
      <div className="page-heading">
        <Link className="eyebrow" href="/collections">
          Collections / {collection.title}
        </Link>
        <h1>{collection.title}.</h1>
        <p className="muted">{collection.description}</p>
      </div>
      <ProductGrid products={collection.products.nodes} />
      {collection.products.pageInfo.hasNextPage ? (
        <div className="pagination">
          <Link
            className="button button-outline"
            href={`/collections/${handle}?${new URLSearchParams({ after: collection.products.pageInfo.endCursor ?? '' })}`}
          >
            Next page →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
