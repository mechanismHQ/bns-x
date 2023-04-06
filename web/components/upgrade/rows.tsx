import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box, Stack, SpaceBetween, Flex } from '@nelson-ui/react';
import { Text } from '../text';
import { ExternalTx } from '@components/icons/external-tx';
import { CheckIcon } from '@components/icons/check';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { Spinner } from '@components/spinner';
import { migrateNameAtom, nameUpgradingAtom } from '@store/migration';
import { CenterBox } from '@components/layout';
import { atom } from 'jotai';
import { styled } from '@common/theme';
import { usePunycode } from '@common/hooks/use-punycode';
import { ArrowLeft } from 'lucide-react';
import { BoxLink } from '@components/link';
import {
  currentAccountIndexAtom,
  currentIsPrimaryState,
  primaryAccountIndexState,
} from '@store/micro-stacks';

interface BaseRowProps extends BoxProps {
  children?: React.ReactNode;
  txidAtom?: Atom<string | undefined>;
}

const emptyAtom = atom<string | undefined>(undefined);

export const DoneRow: React.FC<BaseRowProps> = ({ children, txidAtom, ...props }) => {
  const _atom: Atom<string | undefined> = typeof txidAtom === 'undefined' ? emptyAtom : txidAtom;
  const txid = useAtomValue(_atom);
  return (
    <SpaceBetween isInline alignItems="center" p="30px" {...props}>
      <Stack isInline spacing="$3" alignItems="center">
        <CheckIcon />
        <Text variant="Label01" color="$onSurface-text">
          {children}
        </Text>
      </Stack>
      {txid && <ExternalTx txId={txid} />}
    </SpaceBetween>
  );
};

export const PendingRow: React.FC<BaseRowProps> = ({ txidAtom, children, ...props }) => {
  const _atom: Atom<string | undefined> = typeof txidAtom === 'undefined' ? emptyAtom : txidAtom;
  const txid = useAtomValue(_atom);
  return (
    <SpaceBetween isInline alignItems="center" p="30px" {...props}>
      <Stack isInline spacing="$3" alignItems="center">
        <Spinner />
        <Text variant="Label01" color="$onSurface-text-dim">
          {children}
        </Text>
      </Stack>
      {txid && <ExternalTx txId={txid} />}
    </SpaceBetween>
  );
};

export const Divider: React.FC<{ children?: React.ReactNode }> = () => {
  return <Box height="1px" borderTop="1px solid $onSurface-border-subdued" />;
};

export const NameHeading: React.FC<{ children?: React.ReactNode }> = () => {
  const name = usePunycode(useAtomValue(nameUpgradingAtom));
  return (
    <Text variant="Heading06" color="$text-onsurface-very-dim">
      {name}
    </Text>
  );
};

export const UpgradeBox: React.FC<{
  children?: React.ReactNode | React.ReactNode[];
  bottom?: React.ReactNode;
}> = ({ children, bottom }) => {
  const currentIsPrimary = useAtomValue(currentIsPrimaryState);
  return (
    <>
      {!currentIsPrimary && (
        <BoxLink href="/accounts">
          <Flex px="27px" alignItems="center" maxWidth="160px">
            <ArrowLeft color="var(--colors-text-dim)" className="h-4" />
            <Text variant="Body02" color="$text-dim">
              Accounts
            </Text>
          </Flex>
        </BoxLink>
      )}
      <Box flexGrow={1} />
      <Stack spacing="0" alignItems={'center'} width="100%" pb="50px" px="29px">
        <NameHeading />
        <CenterBox mt="20px" mb="30px">
          <Stack spacing="0">{children}</Stack>
        </CenterBox>
        {bottom}
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
