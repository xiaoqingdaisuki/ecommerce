import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ProductGrid } from '@/components/collection/product-grid';
import { getCollection, getCollections } from '@/lib/shopify/queries/catalog.server';
import {
  COLLECTION_SORT_OPTIONS,
  collectionSort,
  pageNumber,
  type ShopifySearchParams,
} from '@/lib/utils/shopify-routes';
import { Pagination } from '@/components/collection/pagination';

export async function generateStaticParams() {
  return [
    { handle: 'all' },
    ...(await getCollections()).filter(({ handle }) => handle !== 'all').map(({ handle }) => ({ handle })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = (await getCollections()).find((item) => item.handle === handle);
  return {
    title: collection?.title ?? (handle === 'all' ? 'All products' : 'Collection'),
    description: collection?.description,
    alternates: { canonical: `/collections/${handle}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<ShopifySearchParams>;
}) {
  await connection();
  const [{ handle }, search] = await Promise.all([params, searchParams]);
  const page = pageNumber(search.page);
  if (!page) notFound();
  const sort = collectionSort(search.sort_by);
  const collection = await getCollection(handle, page, sort);
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
      <form action={`/collections/${handle}`} method="get" className="catalog-toolbar">
        <select name="sort_by" defaultValue={sort} aria-label="Sort products">
          {COLLECTION_SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="button" type="submit">
          Sort
        </button>
      </form>
      <ProductGrid products={collection.products.nodes} />
      <Pagination
        pathname={`/collections/${handle}`}
        params={search}
        page={page}
        hasNextPage={collection.products.pageInfo.hasNextPage}
      />
    </section>
  );
}
