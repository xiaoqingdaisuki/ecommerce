import Link from 'next/link';
import { Icon } from '@/components/ui/icons';

export function ServiceStrip() {
  return (
    <section className="border-y border-neutral-200 bg-white" aria-label="Shop with confidence">
      <div className="store-container grid grid-cols-2 gap-x-5 gap-y-7 py-8 lg:grid-cols-4 lg:py-10">
        {[
          {
            icon: 'truck',
            title: 'Delivery, made clear',
            body: 'See options at checkout',
            href: '/support#delivery',
          },
          {
            icon: 'return',
            title: 'Here when you need us',
            body: 'Explore returns & support',
            href: '/support#returns',
          },
          {
            icon: 'shield',
            title: 'Shop with confidence',
            body: 'Secure Shopify checkout',
            href: '/support#payment',
          },
          { icon: 'user', title: 'Your own space', body: 'Orders, details & more', href: '/account' },
        ].map((item) => (
          <Link
            key={item.icon}
            href={item.href}
            className="flex items-center gap-3 lg:justify-center lg:gap-4"
          >
            <Icon
              name={item.icon as 'truck' | 'return' | 'shield' | 'user'}
              width={25}
              height={25}
              className="shrink-0"
            />
            <div>
              <h3 className="text-xs font-semibold lg:text-sm">{item.title}</h3>
              <p className="mt-1 text-[11px] text-neutral-500 lg:text-xs">{item.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
