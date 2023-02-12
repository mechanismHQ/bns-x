import React, { useCallback, useEffect } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  combinedZonefileState,
  inscriptionZonefileState,
  signedInscriptionZonefileAtom,
  userNameState,
  userZonefileState,
  zonefileBtcAddressAtom,
} from '@store/names';
import { Button } from '@components/button';
import { useSignZonefile } from '@common/hooks/use-sign-zonefile';
import { Link, LinkText } from '@components/link';
import { Input } from '@components/form';
import { useCopyToClipboard } from 'usehooks-ts';
import { useAtomCallback } from 'jotai/utils';
import { useAuthState } from '@store/micro-stacks';
import { inscriptionIdAtom, uploadInscriptionMutation } from '@store/inscriptions';
import { useInput } from '@common/hooks/use-input';
import { docTitleState } from '@store/index';
import { CodeBlock } from '@components/code';

export const Inscribe: React.FC<{ children?: React.ReactNode }> = () => {
  const name = useAtomValue(userNameState);
  const zonefile = useAtomValue(combinedZonefileState);
  const inscriptionZonefile = useAtomValue(inscriptionZonefileState);
  const { signMessage } = useSignZonefile();
  const signedInscription = useAtomValue(signedInscriptionZonefileAtom);
  const [_, copy] = useCopyToClipboard();
  const { isSignedIn, openAuthRequest } = useAuthState();
  const inscriptionId = useInput(useAtom(inscriptionIdAtom));
  const btcAddress = useInput(useAtom(zonefileBtcAddressAtom));
  const setTitle = useSetAtom(docTitleState);

  useEffect(() => {
    setTitle('Inscribe your .btc name');
  });

  const copyToClipboard = useAtomCallback(
    useCallback(
      async get => {
        const zf = get(inscriptionZonefileState);
        if (zf !== null) {
          await copy(zf);
        }
      },
      [copy]
    )
  );

  const signIn = useCallback(() => {
    void openAuthRequest();
  }, [openAuthRequest]);

  const [uploadResult, uploadMutation] = useAtom(uploadInscriptionMutation[1]);

  const uploadInscription = useAtomCallback(
    useCallback(
      async get => {
        const uploadStatus = get(uploadInscriptionMutation[1]);
        console.log('uploadStatus', uploadStatus);
        if (!uploadStatus.isLoading && !uploadStatus.isSuccess) {
          await uploadMutation([undefined]);
        }
      },
      [uploadMutation]
    )
  );

  const downloadInscription = useAtomCallback(
    useCallback(get => {
      const zonefile = get(inscriptionZonefileState);
      if (zonefile === null) return;
      const lines = zonefile.replace(/\n/g, '\r\n');
      const file = new Blob([lines], { type: 'text/plain' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(file);
      element.download = 'zonefile.txt';
      // element.style.position = 'abolute';
      document.body.appendChild(element);
      element.click();
    }, [])
  );

  if (!isSignedIn) {
    return (
      <Stack spacing="$10" px="29px">
        <Text variant="Heading02">Inscribe your .btc name on Ordinals</Text>
        <Text variant="Body01">
          Establish the provenance of your BNS name by writing a copy of your zonefile to Bitcoin
          using ordinals
        </Text>
        <Stack spacing="$4">
          <Text variant="Heading04">What is BNS?</Text>
          <Text variant="Body01">
            The Bitcoin Name System is a protocol established in 2014. It started as an experiment
            on Namecoin and quickly branched into it&apos;s own protocol. To date, there are over
            250,000 names registered using BNS.
          </Text>
          <Box>
            <Link href="https://docs.stacks.co/docs/stacks-academy/bns" target="_blank">
              Learn more about BNS
            </Link>
          </Box>
        </Stack>
        {/* <Text variant="Body01">Connect your wallet to inscribe your BNS name</Text> */}
        {/* <Button onClick={signIn}>Connect Wallet</Button> */}
      </Stack>
    );
  }

  if (name === null) {
    return (
      <Stack spacing="$10" px="29px">
        <Text variant="Heading02">You need a name!</Text>
        <Text variant="Body01">
          We&apos;re unable to find a BNS owned by the address you&apos;re logged in with.
        </Text>
        <Button
          onClick={() => {
            window.open('https://btc.us', '_blank');
          }}
        >
          Mint a .btc name
        </Button>
      </Stack>
    );
  }
  return (
    <Stack spacing="$8" px="29px">
      <Text variant="Heading02">Inscribe your .btc name on Ordinals</Text>
      <Text variant="Body01">
        Establish the provenance of your BNS name by writing a copy of your zonefile to Bitcoin
        using ordinals
      </Text>
      {signedInscription === null && (
        <>
          <Text variant="Heading035">Step 1: prove ownership by signing your zonefile</Text>
          <Stack spacing="$4">
            <Text variant="Body01">
              Add your BTC address to enable BTC transfers to your BNS name:
            </Text>
            <Input placeholder="Your BTC address" {...btcAddress.props} />
          </Stack>
          <Stack spacing="$4">
            <Text variant="Body01">Here&apos;s your zonefile:</Text>
            <CodeBlock>{zonefile}</CodeBlock>
          </Stack>
          <Button onClick={signMessage}>Sign your zonefile</Button>
        </>
      )}

      {signedInscription !== null && (
        <>
          <Text variant="Heading035">Step 2: publish your inscription</Text>
          <Stack spacing="$4">
            <Text variant="Body01">
              You can upload an inscription using{' '}
              <Link
                variant="Body01"
                href="https://docs.ordinals.com/guides/inscriptions.html"
                target="_blank"
              >
                ord
              </Link>{' '}
              or through a service like{' '}
              <Link variant="Body01" href="https://gamma.io/ordinals" target="_blank">
                Gamma
              </Link>{' '}
              and{' '}
              <Link variant="Body01" href="https://ordinalsbot.com" target="_blank">
                OrdinalsBot
              </Link>
              .
            </Text>
            <Text variant="Body01">
              Use the &quot;plain text&quot; inscription type if you&apos;re using Gamma, or make
              sure the file&apos;s type is `.txt` if using the Ordinals CLI.
            </Text>
          </Stack>
          <Stack spacing="$4">
            <Text variant="Heading04">Inscription content:</Text>
            <CodeBlock>{inscriptionZonefile}</CodeBlock>
          </Stack>
          <Stack isInline>
            <Button onClick={copyToClipboard}>Copy to clipboard</Button>
            <Button onClick={downloadInscription}>Download file</Button>
          </Stack>
          <Text variant="Heading035">
            Step 3 (optional): broadcast your zonefile to the BNS API
          </Text>

          <Stack spacing="$4">
            <Text variant="Body01">
              If you want apps that use the BNS API to see your zonefile, enter your{' '}
              <span style={{ fontWeight: '500' }}>inscription ID</span> below and click submit.
            </Text>
            <Text variant="Body01">
              This can be found on your inscription&apos;s page on{' '}
              <Link variant="Body01" href="https://ordinals.com" target="_blank">
                ordinals.com
              </Link>{' '}
              or{' '}
              <Link variant="Body01" href="https://gamma.io" target="_blank">
                gamma.io
              </Link>
              .
            </Text>

            <Box>
              <Input placeholder="Inscription ID or URL" {...inscriptionId.props} />
            </Box>
          </Stack>
          {uploadResult.isSuccess ? (
            <>
              <Text variant="Body01">Your inscription was saved successfully!</Text>
            </>
          ) : (
            <Button type="big" disabled={uploadResult.isLoading} onClick={uploadInscription}>
              {uploadResult.isLoading ? 'waiting..' : 'Submit'}
            </Button>
          )}
          {uploadResult.isError && (
            <Text variant="Body01">
              It looks like there was an error when validating your inscription. If the inscription
              isn&apos;t confirmed yet, wait for confirmation.
            </Text>
          )}
        </>
      )}
    </Stack>
  );
};
