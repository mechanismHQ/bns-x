import React, { useCallback, useEffect, useMemo } from 'react';
import { Stack, Box, Flex } from '@nelson-ui/react';
import { Text } from './text';
import { atom, useAtom, useAtomValue } from 'jotai';
import { stxAddressAtom } from '@store/micro-stacks';
import { useInput } from '../common/hooks/use-input';
import { Input } from './form';
import { useAtomCallback } from 'jotai/utils';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { Button } from './button';
import { currentUserV1NameState } from '../common/store/names';
import { useRouter } from 'next/router';
import { useAccountPath } from '@common/hooks/use-account-path';
import { getTestnetNamespace } from '@common/constants';
import { toPunycode } from '@bns-x/punycode';

const nameAtom = atom('');

function useFakeName() {
  const setFake = useAtomCallback(
    useCallback((get, set) => {
      const name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
      });
      set(nameAtom, name);
      set(submittingAtom, false);
      set(txidAtom, '');
    }, [])
  );
  useEffect(() => {
    void setFake();
  }, [setFake]);
}

const txidAtom = atom('');
const submittingAtom = atom(false);

export const Faucet: React.FC<{ children?: React.ReactNode }> = () => {
  const name = useInput(useAtom(nameAtom));
  const bnsName = useAtomValue(currentUserV1NameState);
  const router = useRouter();
  const submitting = useAtomValue(submittingAtom);
  useFakeName();

  const submit = useAtomCallback(
    useCallback(async (get, set) => {
      const name = get(nameAtom);
      const address = get(stxAddressAtom)!;
      const ascii = toPunycode(name);
      const url = `/api/faucet?name=${ascii}&recipient=${address}`;
      set(submittingAtom, true);
      const res = await fetch(url);
      const { txid } = (await res.json()) as { txid: string };
      set(txidAtom, txid);
      // set(submittingAtom, false);
    }, [])
  );

  const profilePath = useAccountPath('/profile');

  const namespace = useMemo(() => {
    return getTestnetNamespace();
  }, []);

  useEffect(() => {
    if (bnsName !== null) {
      void router.push(profilePath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bnsName]);

  return (
    <Stack p="30px">
      <Box>
        <Text variant="Heading03">BNS Faucet</Text>
      </Box>
      <Text variant="Body01">Get a name and some STX for testing</Text>
      <Stack spacing="$1">
        <Text variant="Body01" as="label">
          Name
        </Text>
        <Text variant="Caption01" color="$text-dim">
          You&apos;ll get the name &quot;{name.value}.{namespace}&quot;
        </Text>
        <Input autoFocus {...name.props} />
      </Stack>
      {submitting ? (
        <Box>
          <Text variant="Body01">Request submitted - you&apos;ll be redirected soon.</Text>
        </Box>
      ) : (
        <Box width="100%">
          <Button maxWidth="100%" onClick={submit}>
            Submit
          </Button>
        </Box>
      )}
    </Stack>
  );
};
