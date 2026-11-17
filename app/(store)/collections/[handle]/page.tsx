import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProductSkeleton } from '@/components/ui/skeletons';
import { ProductGrid } from '@/components/collection/product-grid';
import { getCollection, getCollections, getProductTypes } from '@/lib/shopify/queries/catalog.server';
import { collectionSort, pageNumber, type ShopifySearchParams } from '@/lib/utils/shopify-routes';
import { Pagination } from '@/components/collection/pagination';
import { catalogFilters } from '@/lib/utils/catalog-filters';
import { CatalogSidebar, CatalogToolbar } from '@/components/collection/catalog-controls';
import { Icon } from '@/components/ui/icons';
import { COLLECTION_PRESETS, collectionPreset } from '@/lib/utils/collection-presets';

export async function generateStaticParams() {
  return [
    { handle: 'all' },
    ...[
      ...new Set([
        ...(await getCollections()).map(({ handle }) => handle),
        ...Object.keys(COLLECTION_PRESETS),
      ]),
    ]
      .filter((handle) => handle !== 'all')
      .map((handle) => ({ handle })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const collection = (await getCollections()).find((item) => item.handle === handle);
  return {
    title:
      collection?.title ??
      collectionPreset(handle)?.title ??
      (handle === 'all' ? 'All products' : 'Collection'),
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
  const { handle } = await params;
  const collections = await getCollections();
  const collection =
    collections.find((item) => item.handle === handle) ??
    (handle === 'all'
      ? { title: 'All products', description: '' }
      : collectionPreset(handle)
        ? { title: collectionPreset(handle)!.title, description: '' }
        : null);
  if (!collection) notFound();
  return (
    <section className="store-container collection-page">
      <div className="collection-heading">
        <h1>{collection.title}</h1>
        {collection.description ? (
          <p className="muted mt-3 max-w-2xl leading-7">{collection.description}</p>
        ) : null}
      </div>
      {handle === 'all' ? <CollectionSearch /> : null}
      <Suspense
        fallback={
          <div
            className={`catalog-layout min-h-screen ${handle !== 'all' ? 'catalog-layout-split' : ''}`}
            role="status"
            aria-label="Loading collection"
          >
            {handle !== 'all' ? (
              <div className="hidden lg:flex lg:flex-col gap-6" aria-hidden="true">
                <div className="skeleton h-10 rounded" />
                <div className="skeleton h-64 rounded" />
              </div>
            ) : null}
            <ProductSkeleton count={9} />
          </div>
        }
      >
        <CollectionResults handle={handle} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function CollectionResults({
  handle,
  searchParams,
}: {
  handle: string;
  searchParams: Promise<ShopifySearchParams>;
}) {
  const search = await searchParams;
  const page = pageNumber(search.page);
  if (!page) notFound();
  const sort = collectionSort(search.sort_by, collectionPreset(handle)?.sort ?? 'manual');
  const filters = catalogFilters(search);
  const [collection, types] = await Promise.all([
    getCollection(handle, page, sort, filters),
    getProductTypes(),
  ]);
  if (!collection) notFound();
  return (
    <div className={`catalog-layout ${handle !== 'all' ? 'catalog-layout-split' : ''}`}>
      {handle !== 'all' ? (
        <CatalogSidebar pathname={`/collections/${handle}`} filters={filters} sort={sort} types={types} />
      ) : null}
      <div className="min-w-0">
        {handle !== 'all' ? <CollectionSearch /> : null}
        <CatalogToolbar
          pathname={`/collections/${handle}`}
          filters={filters}
          sort={sort}
          types={types}
          count={collection.products.nodes.length}
          withSidebar={handle !== 'all'}
        />
        {Object.values(filters).some((value) => value !== undefined) ? (
          <div className="mb-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-neutral-500">Filters applied</span>
            <Link
              href={`/collections/${handle}`}
              className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2"
            >
              Clear all <Icon name="close" width={13} height={13} />
            </Link>
          </div>
        ) : null}
        <ProductGrid products={collection.products.nodes} />
        <Pagination
          pathname={`/collections/${handle}`}
          params={search}
          page={page}
          hasNextPage={collection.products.pageInfo.hasNextPage}
        />
      </div>
    </div>
  );
}

function CollectionSearch() {
  return (
    <form action="/search" method="get" className="collection-search">
      <Icon name="search" width={18} />
      <input type="hidden" name="type" value="product" />
      <input
        name="q"
        type="search"
        aria-label="Search store products"
        placeholder="Search products"
        maxLength={160}
        required
      />
      <button type="submit" className="icon-button" aria-label="Submit product search">
        <Icon name="arrow" width={18} />
      </button>
    </form>
  );
}
