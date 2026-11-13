import { notFound } from 'next/navigation';
import { CmsContent } from '@/components/layout/cms-content';
import { getPage } from '@/lib/shopify/queries/content.server';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) return { title: 'Page not found' };
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    alternates: { canonical: `/pages/${handle}` },
  };
}

export default async function ContentPage({ params }: { params: Promise<{ handle: string }> }) {
  const page = await getPage((await params).handle);
  if (!page) notFound();
  return (
    <article className="container page-section prose">
      <h1>{page.title}</h1>
      <CmsContent html={page.body} />
    </article>
  );
}
