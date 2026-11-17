import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/shopify/queries/blog.server';
import { CmsContent } from '@/components/layout/cms-content';

type Props = { params: Promise<{ blogHandle: string; articleHandle: string }> };

export async function generateMetadata({ params }: Props) {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticle(blogHandle, articleHandle);
  if (!article) notFound();
  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt,
    alternates: { canonical: `/blogs/${blogHandle}/${articleHandle}` },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { blogHandle, articleHandle } = await params;
  const article = await getArticle(blogHandle, articleHandle);
  if (!article) notFound();
  return (
    <article className="store-container page-section prose">
      <h1>{article.title}</h1>
      <CmsContent html={article.contentHtml} />
    </article>
  );
}
