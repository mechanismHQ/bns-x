import { useIsSSR } from '../common/hooks/use-is-ssr';
import React, { Suspense } from 'react';

export const SafeSuspense: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const ssr = useIsSSR();

  if (ssr) return null;

  return <Suspense fallback={fallback || <></>}>{children}</Suspense>;
};
