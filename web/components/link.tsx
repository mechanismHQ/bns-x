import React from 'react';
import NextLink from 'next/link';
import type { UrlObject } from 'url';
// import { getTxUrl } from '../common/utils';
import type { BoxProps, StackProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import { Stack } from '@nelson-ui/react';
import { Text } from '@nelson-ui/react';
import { Button } from './button';
import { styled } from '@common/theme';

export type Url = string | UrlObject;
export interface LinkProps extends Omit<BoxProps, 'href'> {
  href: Url;
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

export const Link: React.FC<LinkProps> = ({ href, prefetch, children, ...props }) => {
  return (
    // <Stack height="24px">
    <NextLink href={href} passHref prefetch={prefetch}>
      <LinkInner {...props} as="a">
        {children}
      </LinkInner>
    </NextLink>
    //   {plain !== false && <Box width="100%" height="2px" backgroundColor="$text-very-dim" />}
    // </Stack>
  );
};

const StyledLinkContainer = styled(Stack, {
  height: '24px',
  '&:hover': {
    '& .link-underline': {
      display: 'none',
    },
  },
});

export const LinkText: React.FC<LinkProps> = ({ href, prefetch, children, ...props }) => {
  return (
    <StyledLinkContainer as="div" spacing="0" display={props?.display ?? 'block'}>
      <NextLink href={href} passHref prefetch={prefetch}>
        <LinkInner textDecoration="none" {...props} as="a">
          {children}
        </LinkInner>
      </NextLink>
      <Box
        width="100%"
        className="link-underline"
        height="1px"
        backgroundColor="$text-very-dim"
        // border="1px solid $text-very-dim"
        position="relative"
        top="-2px"
        // boxSizing={""}
      />
    </StyledLinkContainer>
  );
};

type InnerLinkProps = Omit<LinkProps, 'href' | 'prefetch'>;

export const LinkInner: React.FC<InnerLinkProps> = React.forwardRef(
  ({ children, plain, ...props }, ref) => {
    const extra = plain
      ? {
          textDecoration: 'none',
          color: props.color ?? '$text',
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
      <Text
        textDecoration="underline"
        cursor="pointer"
        color="$text-subdued"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ref={ref as any}
        {...extra}
        {...props}
      >
        {children}
      </Text>
    );
  }
);
LinkInner.displayName = 'LinkInner';

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
