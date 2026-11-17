import Link from 'next/link';
import { getShop } from '@/lib/shopify/queries/content.server';
import { Icon } from '@/components/ui/icons';
import { storefrontHref } from '@/lib/utils/storefront-url';
import { storeDomain } from '@/lib/shopify/env';

export const metadata = {
  title: 'Help center',
  description: 'Find information about delivery, returns, payment and your account.',
};

export default async function SupportPage() {
  const shop = await getShop();
  const contactItem = shop.mainMenu.find((item) => /contact/i.test(item.title));
  const contactHref = storefrontHref(contactItem?.url ?? null, [
    storeDomain,
    new URL(shop.primaryDomain.url).hostname,
  ]);
  return (
    <section className="store-container page-section">
      <div className="page-heading">
        <p className="eyebrow text-emerald-700">Here to help</p>
        <h1>
          A little clarity.
          <br />A better experience.
        </h1>
        <p className="muted">Everything you need to shop with confidence.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          {
            id: 'delivery',
            icon: 'truck',
            title: 'Shipping & delivery',
            text: 'Available destinations, delivery options, shipping costs and taxes are confirmed at checkout.',
            policy: shop.shippingPolicy,
          },
          {
            id: 'returns',
            icon: 'return',
            title: 'Returns & refunds',
            text: 'Check the store’s published policy for return eligibility, conditions and refund details.',
            policy: shop.refundPolicy,
          },
          {
            id: 'payment',
            icon: 'shield',
            title: 'Secure payments',
            text: 'Orders are completed through secure Shopify checkout. Available payment methods appear at checkout.',
            policy: shop.termsOfService,
          },
        ].map((item) => (
          <article
            id={item.id}
            key={item.id}
            className="scroll-mt-32 rounded-xl border border-neutral-200 bg-white p-8"
          >
            <Icon name={item.icon as 'truck' | 'return' | 'shield'} width={30} height={30} />
            <h2 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-neutral-500">{item.text}</p>
            {item.policy ? (
              <Link href={`/policies/${item.policy.handle}`} className="text-link mt-6">
                Read {item.policy.title.toLowerCase()} <Icon name="arrow" width={16} />
              </Link>
            ) : (
              <p className="mt-5 text-xs text-neutral-500">
                No additional policy has been published. Contact the store for details.
              </p>
            )}
          </article>
        ))}
      </div>
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl bg-[#e8efec] p-8 lg:p-10">
          <p className="eyebrow">Your account</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            All your details.
            <br />
            One familiar place.
          </h2>
          <p className="mt-4 text-sm text-neutral-600">Sign in to view orders and manage your details.</p>
          <Link href="/account" className="button button-dark mt-6">
            Go to my account <Icon name="arrow" width={17} />
          </Link>
        </div>
        <div className="product-details">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Shopping questions</h2>
          <details>
            <summary>
              How do I change my cart?
              <Icon name="chevron" className="disclosure-chevron" width={16} />
            </summary>
            <p>
              Open the cart in the navigation. Use the quantity controls or remove an item before proceeding
              to checkout.
            </p>
          </details>
          <details>
            <summary>
              How do I know if an item is available?
              <Icon name="chevron" className="disclosure-chevron" width={16} />
            </summary>
            <p>
              Choose a product option to see its current availability and price. Sold-out options are marked
              clearly.
            </p>
          </details>
          <details>
            <summary>
              Where can I read your policies?
              <Icon name="chevron" className="disclosure-chevron" width={16} />
            </summary>
            <p>Published store policies are linked below and in the footer.</p>
            {shop.privacyPolicy ? (
              <Link href={`/policies/${shop.privacyPolicy.handle}`} className="text-link mt-4">
                {shop.privacyPolicy.title}
              </Link>
            ) : null}
          </details>
        </div>
      </div>
      {contactHref ? (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-neutral-200 p-7">
          <div>
            <h2 className="text-lg font-semibold">Still have a question?</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Get in touch with our team for a little more guidance.
            </p>
          </div>
          <Link href={contactHref} className="button button-outline">
            Contact us <Icon name="arrow" width={16} />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
