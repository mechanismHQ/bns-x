import React from 'react';
import { Box, Stack, SpaceBetween, Flex, BoxProps } from '@nelson-ui/react';
import { Text } from '../text';
import { ExternalTx } from '@components/icons/external-tx';
import { CheckIcon } from '@components/icons/check';
import { Atom, useAtomValue } from 'jotai';
import { Spinner } from '@components/spinner';

interface BaseRowProps extends BoxProps {
  children?: React.ReactNode;
  txidAtom: Atom<string | undefined>;
}

export const DoneRow: React.FC<BaseRowProps> = ({ children, txidAtom, ...props }) => {
  const txid = useAtomValue(txidAtom);
  return (
    <SpaceBetween isInline alignItems="center" p="30px" {...props}>
      <Stack isInline spacing="$3" alignItems="center">
        <CheckIcon />
        <Text variant="Label01" color="$onSurface-text">
          {children}
        </Text>
      </Stack>
      <ExternalTx txId={txid} />
    </SpaceBetween>
  );
};

export const PendingRow: React.FC<BaseRowProps> = ({ txidAtom, children, ...props }) => {
  const txid = useAtomValue(txidAtom);
  return (
    <SpaceBetween isInline alignItems="center" p="30px" {...props}>
      <Stack isInline spacing="$3" alignItems="center">
        <Spinner />
        <Text variant="Label01" color="$onSurface-text-dim">
          {children}
        </Text>
      </Stack>
      <ExternalTx txId={txid} />
    </SpaceBetween>
  );
};

export const Divider: React.FC<{ children?: React.ReactNode }> = () => {
  return <Box height="1px" borderTop="1px solid $onSurface-border-subdued" />;
};
