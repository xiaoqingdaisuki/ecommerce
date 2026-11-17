import Link from 'next/link';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getBlog } from '@/lib/shopify/queries/blog.server';
import { Pagination } from '@/components/collection/pagination';
import { pageNumber, type ShopifySearchParams } from '@/lib/utils/shopify-routes';

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ blogHandle: string }>;
  searchParams: Promise<ShopifySearchParams>;
}) {
  await connection();
  const [{ blogHandle }, search] = await Promise.all([params, searchParams]);
  const page = pageNumber(search.page);
  if (!page) notFound();
  const blog = await getBlog(blogHandle, page);
  if (!blog) notFound();
  return (
    <section className="store-container page-section">
      <div className="page-heading">
        <h1>{blog.title}</h1>
      </div>
      {blog.articles.nodes.map((article) => (
        <article className="prose" key={article.id}>
          <h2>
            <Link href={`/blogs/${blog.handle}/${article.handle}`}>{article.title}</Link>
          </h2>
          <p>{article.excerpt}</p>
        </article>
      ))}
      <Pagination
        pathname={`/blogs/${blog.handle}`}
        params={search}
        page={page}
        hasNextPage={blog.articles.pageInfo.hasNextPage}
      />
    </section>
  );
}
