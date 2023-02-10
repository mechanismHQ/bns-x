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
import { LinkText } from '@components/link';
import { Input } from '@components/form';
import { useCopyToClipboard } from 'usehooks-ts';
import { useAtomCallback } from 'jotai/utils';
import { useAuthState } from '@store/micro-stacks';
import { inscriptionIdAtom, uploadInscriptionMutation } from '@store/inscriptions';
import { useInput } from '@common/hooks/use-input';
import { docTitleState } from '@store/index';

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
      const zonefile = get(combinedZonefileState);
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
        <Text variant="Heading02">Inscribe your .btc name</Text>
        <Text variant="Body01">You&apos;ll need to login to inscribe your name</Text>
        <Button onClick={signIn}>Connect Wallet</Button>
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
        Establish the provenance of your BNS name by inscribing your zonefile on the Bitcoin
        blockchain.
      </Text>
      {signedInscription === null && (
        <>
          <Text variant="Heading05">Step 1: prove ownership by signing your zonefile</Text>
          <Stack spacing="$4">
            <Text variant="Body01">
              Add your BTC address to enable BTC transfers to your BNS name:
            </Text>
            <Input placeholder="Your BTC address" {...btcAddress.props} />
          </Stack>
          <Stack spacing="$4">
            <Text variant="Body01">Here&apos;s what your zonefile looks like:</Text>
            <Box
              backgroundColor="$primary-action-subdued"
              // maxWidth="500px"
              borderRadius="5px"
              px="12px"
              overflowX="scroll"
            >
              <Text variant="Body01">
                <pre>{zonefile}</pre>
              </Text>
            </Box>
          </Stack>
          <Button onClick={signMessage}>Sign your zonefile</Button>
        </>
      )}

      {signedInscription !== null && (
        <>
          <Text variant="Heading05">Step 2: publish your inscription</Text>
          <Stack spacing="$4">
            <Stack isInline spacing="5px">
              <Text variant="Body01">You can upload an inscription using </Text>
              <LinkText
                variant="Body01"
                href="https://docs.ordinals.com/guides/inscriptions.html"
                target="_blank"
              >
                ord
              </LinkText>
              <Text variant="Body01">or through a service like</Text>
              <LinkText variant="Body01" href="https://gamma.io/ordinals" target="_blank">
                Gamma
              </LinkText>
              <Text variant="Body01">and</Text>
              <LinkText variant="Body01" href="https://gamma.io/ordinals" target="_blank">
                SatoshiBot
              </LinkText>
              <Text variant="Body01">.</Text>
            </Stack>
            <Text variant="Body01">
              Use the &quot;plain text&quot; inscription type and use this as the content:
            </Text>
          </Stack>
          <Box
            backgroundColor="$primary-action-subdued"
            // maxWidth="500px"
            borderRadius="5px"
            px="12px"
            overflowX="scroll"
          >
            <Text variant="Body01">
              <pre>{inscriptionZonefile}</pre>
            </Text>
          </Box>
          <Stack isInline>
            <Button onClick={copyToClipboard}>Copy to clipboard</Button>
            <Button onClick={downloadInscription}>Download file</Button>
          </Stack>
          <Text variant="Heading05">Step 3: broadcast your zonefile to the BNS API</Text>
          <Text variant="Body01">
            This step is temporarily required until the BNS API automatically resolves inscribed
            zonefiles.
          </Text>
          <Stack spacing="$4">
            <Text variant="Body01">
              Paste in your inscription&aposs ID. This can be found on your inscription&apos;s page
              on ordinals.com
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
