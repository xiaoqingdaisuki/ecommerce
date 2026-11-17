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
  const { handle } = await params;
  const page = await getPage(handle);
  if (!page) notFound();
  if (handle === 'contact') {
    return (
      <article className="store-container page-section flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Contact Us</h1>
        {page.body.trim() ? (
          <div className="prose mt-6 w-full max-w-xl">
            <CmsContent html={page.body} />
          </div>
        ) : null}
        <section
          aria-labelledby="contact-github"
          className="mt-12 flex max-w-xl flex-col items-center gap-4 lg:mt-16"
        >
          <h2 id="contact-github" className="text-base font-semibold">
            Let’s connect
          </h2>
          <p className="text-sm leading-7 text-neutral-600">
            Have a question, feedback, or an idea for collaboration? Find me on GitHub.
          </p>
          <a
            href="https://github.com/xiaoqingdaisuki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-emerald-700 hover:decoration-current"
            aria-label="xiaoqingdaisuki on GitHub (opens in a new tab)"
          >
            github.com/xiaoqingdaisuki
          </a>
        </section>
      </article>
    );
  }
  return (
    <article className="store-container page-section prose">
      <h1>{page.title}</h1>
      <CmsContent html={page.body} />
    </article>
  );
}
