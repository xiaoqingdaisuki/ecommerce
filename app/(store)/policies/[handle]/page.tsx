import { notFound } from 'next/navigation';
import { CmsContent } from '@/components/layout/cms-content';
import { getShop } from '@/lib/shopify/queries/content.server';

async function findPolicy(handle: string) {
  const shop = await getShop();
  return [shop.privacyPolicy, shop.refundPolicy, shop.shippingPolicy, shop.termsOfService].find(
    (policy) => policy?.handle === handle,
  );
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return {
    title: (await findPolicy(handle))?.title ?? 'Policy',
    alternates: { canonical: `/policies/${handle}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ handle: string }> }) {
  const policy = await findPolicy((await params).handle);
  if (!policy) notFound();
  return (
    <article className="store-container page-section prose">
      <h1>{policy.title}</h1>
      <CmsContent html={policy.body} />
    </article>
  );
}
