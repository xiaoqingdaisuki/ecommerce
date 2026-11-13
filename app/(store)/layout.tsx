import { Suspense, type ReactNode } from 'react';
import Loading from './loading';

/** URL-dependent pages stream below their own route boundary. */
export default function StoreLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
