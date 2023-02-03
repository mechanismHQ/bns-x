import React from 'react';
import NextLink from 'next/link';
// import { getTxUrl } from '../common/utils';
import type { BoxProps } from '@nelson-ui/react';
import { Text } from '@nelson-ui/react';
import { Button } from './button';

export interface LinkProps extends BoxProps {
  href: string;
  prefetch?: boolean;
  variant?:
    | 'Display01'
    | 'Display02'
    | 'Heading01'
    | 'Heading02'
    | 'Heading03'
    | 'Heading04'
    | 'Heading05'
    | 'Label01'
    | 'Label02'
    | 'Label03'
    | 'Body01'
    | 'Body02'
    | 'Caption01'
    | 'Caption02'
    | undefined;
  children: React.ReactNode;
  plain?: boolean;
}

// // eslint-disable-next-line react/display-name
// export const Link = React.forwardRef(({ to, prefetch, ...props }: LinkProps, ref) => {
//   return (
//     <Text as="a" color="$text" {...props} textDecoration="none" ref={ref}>
//       {children}
//     </Text>
//   );
// })

export const Link: React.FC<LinkProps> = ({ href, prefetch, children, plain, ...props }) => {
  const extra = plain
    ? {
        textDecoration: 'none',
        color: '$text',
        _hover: {
          textDecoration: 'underline',
        },
      }
    : {
        _hover: {
          textDecoration: 'none',
        },
      };
  return (
    <NextLink href={href} passHref>
      <LinkText {...{ ...props, ...extra }} as="a">
        {children}
      </LinkText>
    </NextLink>
  );
};

export const LinkText: React.FC<BoxProps & { children: React.ReactNode }> = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Text
        textDecoration="underline"
        cursor="pointer"
        color="$text-subdued"
        ref={ref as any}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
LinkText.displayName = 'LinkText';

export const LinkButton: React.FC<{
  children: React.ReactNode;
  href: string;
}> = ({ href, children }) => {
  return (
    <NextLink href={href}>
      <Button>{children}</Button>
    </NextLink>
  );
};

export const TransactionLink: React.FC<{ txid?: string; children?: React.ReactNode }> = ({
  txid,
  children,
}) => {
  if (!txid) return null;
  const txUrl = `http://localhost:8000/txid/${txid}`;
  return (
    <Link href={txUrl} color="$action-primary" target="_blank">
      {children ?? 'View Transaction'}
    </Link>
  );
};
