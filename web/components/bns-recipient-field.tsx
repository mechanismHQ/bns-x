import type { Atom } from 'jotai';
import { useAtomValue, useAtom } from 'jotai';
import React, { useMemo } from 'react';
import { useInput } from '@common/hooks/use-input';
import type { BnsRecipientState } from '@store/migration';
import { loadable } from 'jotai/utils';
import { Input } from '@components/form';
import { Stack, Flex } from '@nelson-ui/react';
import { Text } from '@components/text';
import { Spinner } from '@components/spinner';
import { CheckIcon } from '@components/icons/check';
import { ErrorIcon } from '@components/icons/error';

export const BnsRecipientField: React.FC<{
  children?: React.ReactNode;
  recipientState: BnsRecipientState;
}> = ({ recipientState }) => {
  const doSendElsewhere = useAtomValue(recipientState.sendElsewhereAtom);
  const recipientInput = useInput(useAtom(recipientState.upgradeRecipientAtom));
  const recipient = useAtomValue(recipientState.upgradeRecipientAtom);
  const recipientAddress = useAtomValue(loadable(recipientState.validRecipientState));
  const isBNS = useAtomValue(recipientState.recipientIsBnsState);

  const bnsInputValid = useMemo(() => {
    if (!isBNS) return false;
    if (recipientAddress.state === 'hasData') {
      return !!recipientAddress.data;
    }
    return false;
  }, [isBNS, recipientAddress]);

  const bnsInputInvalid = useMemo(() => {
    if (!isBNS) return false;
    if (recipientAddress.state !== 'hasData') return false;
    return !recipientAddress.data;
  }, [isBNS, recipientAddress]);

  const stxAddrInvalid = useMemo(() => {
    if (isBNS || !doSendElsewhere || !recipient) return false;
    if (recipientAddress.state !== 'hasData') return false;
    return !recipientAddress.data;
  }, [isBNS, doSendElsewhere, recipientAddress, recipient]);

  const stxAddrValid = useMemo(() => {
    if (isBNS || !doSendElsewhere) return false;
    if (recipientAddress.state !== 'hasData') return false;
    return !!recipientAddress.data;
  }, [isBNS, doSendElsewhere, recipientAddress]);

  return (
    <>
      <Input
        placeholder="Enter a BNS name or Stacks address"
        {...recipientInput.props}
        autoFocus={true}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {recipientAddress.state === 'loading' ? (
        <Stack isInline spacing="$3" alignItems="center">
          <Spinner size={16} />
          <Text variant="Label02" color="$onSurface-text-subdued">
            Fetching BNS name
          </Text>
        </Stack>
      ) : (
        <>
          {bnsInputValid && (
            <Stack isInline spacing="$3" alignItems="center">
              <CheckIcon />
              <Text variant="Label02" color="$onSurface-text-subdued">
                BNS Name looks good
              </Text>
            </Stack>
          )}
          {bnsInputInvalid && (
            <Stack isInline spacing="$3" alignItems="center">
              <ErrorIcon />
              <Text variant="Label02" color="$text-error">
                Invalid BNS name
              </Text>
            </Stack>
          )}
          {stxAddrInvalid && (
            <Stack isInline spacing="$3" alignItems="center">
              <ErrorIcon />
              <Text variant="Label02" color="$text-error">
                Invalid Stacks address
              </Text>
            </Stack>
          )}
          {stxAddrValid && (
            <Stack isInline spacing="$3" alignItems="center">
              <CheckIcon />
              <Text variant="Label02" color="$onSurface-text-subdued">
                Stacks address looks good
              </Text>
            </Stack>
          )}
        </>
      )}
    </>
  );
};
