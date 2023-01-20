import React, { useCallback, useEffect } from 'react';
import { Stack, Box, Flex } from '@nelson-ui/react';
import { Text } from './text';
import { atom, useAtom, useAtomValue } from 'jotai';
import { stxAddressAtom } from '@micro-stacks/jotai';
import { useInput } from '../common/hooks/use-input';
import { Input } from './form';
import { useAtomCallback } from 'jotai/utils';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import { Button } from './button';
import { currentUserV1NameState } from '../common/store/names';
import { useRouter } from 'next/router';

const nameAtom = atom('');

function useFakeName() {
  const setFake = useAtomCallback(
    useCallback((get, set) => {
      const name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
      });
      console.log(name);
      set(nameAtom, name);
    }, [])
  );
  useEffect(() => {
    setFake();
  }, [setFake]);
}

const txidAtom = atom('');
const submittingAtom = atom(false);

export const Faucet: React.FC<{ children?: React.ReactNode }> = () => {
  const address = useAtomValue(stxAddressAtom);
  const name = useInput(useAtom(nameAtom));
  const bnsName = useAtomValue(currentUserV1NameState);
  const router = useRouter();
  const submitting = useAtomValue(submittingAtom);
  useFakeName();

  const submit = useAtomCallback(
    useCallback(async (get, set) => {
      const name = get(nameAtom);
      const address = get(stxAddressAtom)!;
      const url = `/api/faucet?name=${name}&recipient=${address}`;
      set(submittingAtom, true);
      const res = await fetch(url);
      const { txid } = (await res.json()) as { txid: string };
      set(txidAtom, txid);
      // set(submittingAtom, false);
    }, [])
  );

  useEffect(() => {
    if (bnsName?.combined) {
      void router.push({
        pathname: '/upgrade',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bnsName?.combined]);

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
          You&apos;ll get the name &quot;{name.value}.testable&quot;
        </Text>
        <Input {...name.props} />
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
