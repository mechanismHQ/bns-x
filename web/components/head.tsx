import React, { useEffect, useMemo } from 'react';
import NextHead from 'next/head';
import { useAtomValue, useAtom } from 'jotai';
import { getAppUrl, ONLY_INSCRIPTIONS } from '../common/constants';
import { pageTitleState, docTitleState, pageDescriptionState } from '@store';
import { useRouter } from 'next/router';

export const useSetTitle = (title: string) => {
  const [_, setTitle] = useAtom(docTitleState);
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};

export const Head: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const titleText = useAtomValue(pageTitleState);
  const description = useAtomValue(pageDescriptionState);
  const router = useRouter();
  const appUrl = getAppUrl();
  const icon = useMemo(() => {
    return appUrl + '/logo.svg';
  }, [appUrl]);

  const url = useMemo(() => {
    return new URL(appUrl);
  }, [appUrl]);

  return (
    <NextHead>
      <title>{titleText}</title>
      <link rel="icon" href={icon} type="image/svg+xml"></link>
      <meta property="og:title" content={titleText} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={appUrl + router.pathname} />
      <meta property="og:image" content={appUrl + '/images/dots-og.png'} />
      <meta property="twitter:card" content={'summary'} />
      <meta property="twitter:url" content={appUrl + router.pathname} />
      <meta property="twitter:image" content={appUrl + '/images/dots-og.png'} />
      <meta property="twitter:domain" content={url.host} />
      <meta property="twitter:title" content={titleText} />
      <meta property="twitter:description" content={description} />
      {children}
    </NextHead>
  );
};
