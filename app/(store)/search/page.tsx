import Link from 'next/link';
import { ProductGrid } from '@/components/collection/product-grid';
import { getProducts } from '@/lib/shopify/queries/catalog.server';
import { connection } from 'next/server';

export const metadata = { title: 'Shop', description: 'Explore all products and find your next favorite.' };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; after?: string; sort?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 160) : '';
  const after = typeof params.after === 'string' ? params.after : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : 'featured';
  const products = await getProducts(query || undefined, after, sort);
  const next = new URLSearchParams({ ...(query ? { q: query } : {}), sort, after: products.pageInfo.endCursor ?? '' });
  return (
    <section className="container page-section">
      <div className="page-heading">
        <p className="eyebrow">The collection</p>
        <h1>{query ? `Results for “${query}”` : 'All essentials.'}</h1>
        <p className="muted">Considered pieces for everyday living.</p>
      </div>
      <form action="/search" className="catalog-toolbar">
        <input
          aria-label="Search products"
          name="q"
          defaultValue={query}
          placeholder="Search the collection"
          maxLength={160}
        />
        <select name="sort" defaultValue={sort} aria-label="Sort products">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <button className="button" type="submit">
          Search
        </button>
      </form>
      <ProductGrid products={products.nodes} />
      {products.pageInfo.hasNextPage ? (
        <div className="pagination">
          <Link className="button button-outline" href={`/search?${next}`}>
            Next page →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
