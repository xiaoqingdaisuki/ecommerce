import ProductPage, { generateMetadata as productMetadata } from '@/app/(store)/products/[handle]/page';

type Props = {
  params: Promise<{ handle: string; productHandle: string }>;
  searchParams: Promise<{ variant?: string }>;
};

export async function generateMetadata({ params }: Props) {
  return productMetadata({ params: params.then(({ productHandle }) => ({ handle: productHandle })) });
}

export default function ProductInCollectionPage({ params, searchParams }: Props) {
  return (
    <ProductPage
      params={params.then(({ productHandle }) => ({ handle: productHandle }))}
      searchParams={searchParams}
    />
  );
}
