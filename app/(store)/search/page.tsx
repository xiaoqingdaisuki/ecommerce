import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ProductGrid } from '@/components/collection/product-grid';
import { Pagination } from '@/components/collection/pagination';
import { searchStore } from '@/lib/shopify/queries/search.server';
import { pageNumber, type ShopifySearchParams } from '@/lib/utils/shopify-routes';

export const metadata = { title: 'Search', robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<ShopifySearchParams> }) {
  await connection();
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 160) : '';
  const page = pageNumber(params.page);
  if (!page) notFound();
  const type = typeof params.type === 'string' ? params.type : undefined;
  const sort =
    params.sort_by === 'price-ascending' || params.sort_by === 'price-descending' ? params.sort_by : 'relevance';
  const result = query ? await searchStore(query, page, type, sort) : null;
  const products = result?.nodes.filter((item) => item.__typename === 'Product') ?? [];
  const content = result?.nodes.filter((item) => item.__typename !== 'Product') ?? [];
  return (
    <section className="container page-section">
      <div className="page-heading">
        <p className="eyebrow">Search the store</p>
        <h1>{query ? `Results for “${query}”` : 'Search.'}</h1>
      </div>
      <form action="/search" method="get" className="catalog-toolbar">
        <input
          aria-label="Search products and content"
          name="q"
          defaultValue={query}
          placeholder="Search the store"
          maxLength={160}
        />
        {type ? <input type="hidden" name="type" value={type} /> : null}
        <select name="sort_by" defaultValue={sort} aria-label="Sort search results">
          <option value="relevance">Relevance</option>
          <option value="price-ascending">Price: low to high</option>
          <option value="price-descending">Price: high to low</option>
        </select>
        <button className="button" type="submit">
          Search
        </button>
      </form>
      {result ? (
        <>
          {products.length ? <ProductGrid products={products} /> : null}
          {content.map((item) => (
            <article key={item.id} className="prose">
              <h2>
                <Link
                  href={
                    item.__typename === 'Page' ? `/pages/${item.handle}` : `/blogs/${item.blog.handle}/${item.handle}`
                  }
                >
                  {item.title}
                </Link>
              </h2>
              <p>{item.__typename === 'Page' ? item.bodySummary : item.excerpt}</p>
            </article>
          ))}
          {!result.nodes.length ? <p className="empty-state">No matching results. Try another search.</p> : null}
          <Pagination pathname="/search" params={params} page={page} hasNextPage={result.pageInfo.hasNextPage} />
        </>
      ) : (
        <p className="muted">
          Enter a search term, or{' '}
          <Link className="text-link" href="/collections/all">
            browse all products
          </Link>
          .
        </p>
      )}
    </section>
  );
}
