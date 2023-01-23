import React, { useEffect, useMemo } from 'react';
import NextHead from 'next/head';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { getAppUrl } from '../common/constants';
import { pageTitleState, docTitleState } from '@store';

export const useSetTitle = (title: string) => {
  const setTitle = useUpdateAtom(docTitleState);
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};

export const Head: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const titleText = useAtomValue(pageTitleState);
  const icon = useMemo(() => {
    return getAppUrl() + '/logo.svg';
  }, []);
  return (
    <NextHead>
      <title>{titleText}</title>
      <link rel="icon" href={icon} type="image/svg+xml"></link>
      <meta property="og:title" content="Dots" />
      {children}
    </NextHead>
  );
};
