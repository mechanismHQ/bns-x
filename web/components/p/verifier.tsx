import React, { useCallback, useEffect, useMemo } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { loadable, useAtomCallback } from 'jotai/utils';
import { Stack } from '@nelson-ui/react';
import type { Verification } from '@bns-x/png';
import { PNG, hashPNG, DOMAIN, pngMessage, appendChunk, createVerificationChunk } from '@bns-x/png';
import { bytesToBase64, bytesToHex, hexToBytes } from 'micro-stacks/common';
import { useOpenSignMessage, useOpenSignStructuredMessage } from '@micro-stacks/react';
// import { Beutton } from '@components/ui/button';
import { bufferCV, stringAsciiCV, tupleCV } from 'micro-stacks/clarity';
import { verifiedInscriptionData } from '@bns-x/png';
import {
  pngBytesAtom,
  verifiedPngDataState,
  pngSignatureAtom,
  pngAtom,
  pngHashAtom,
  pngVerificationsState,
  verificationNameState,
  imageDataState,
} from '@store/verified-inscriptions';
import { useVerifiedInscriptionDropzone } from '@common/hooks/use-verified-inscription-dropzone';
import Image from 'next/image';
import { Text } from '@components/text';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { CheckIcon } from '@components/icons/check';
import { truncateMiddle } from '@common/utils';
import { DuplicateIcon } from '@components/icons/duplicate';
import { Button } from '@components/button';
import { useConnect } from '@common/hooks/use-connect';
import { LinkText } from '@components/link';

export const VerificationAddress: React.FC<{ verification: Verification }> = ({ verification }) => {
  const name = useAtomValue(loadable(verificationNameState(verification)));

  const hasName = name.state === 'hasData' && name.data !== null;

  return (
    <div className="flex gap-3 items-center">
      <CheckIcon />
      <span className="font-bold text-gray-400">{verification.protocol}</span>
      {hasName && <span className="text-gray-50">{name.data}</span>}
      <span className="text-gray-50">{truncateMiddle(verification.address)}</span>
      <DuplicateIcon className="relative -top-[1px]" clipboardText={verification.address} />
    </div>
  );
};

export const Verifier: React.FC<{ children?: React.ReactNode }> = () => {
  const pngHash = useAtomValue(pngHashAtom);
  const verifiedPngData = useAtomValue(verifiedPngDataState);
  const { dropzone, downloadVerifiedPng, signFile, fetchExample } =
    useVerifiedInscriptionDropzone();
  const verifications = useAtomValue(pngVerificationsState);
  const imageData = useAtomValue(imageDataState);
  const { isSignedIn, openAuthRequest, isRequestPending } = useConnect();

  useEffect(() => {
    if (!pngHash) return;
    console.log('hash', bytesToHex(pngHash));
  }, [pngHash]);

  const verificationRows = useDeepMemo(() => {
    return verifications.map(v => {
      return <VerificationAddress verification={v} key={`${v.protocol}-${v.address}`} />;
    });
  }, [verifications]);

  return (
    <Stack px="29px">
      <div className="flex gap-8 flex-col">
        <div className="w-full">
          <div className="flex flex-col gap-0">
            <Text variant="Heading035">Verified Inscriptions</Text>
            <Text variant="Heading05" color="$text-dim">
              Add or verify cryptographic attestations to an image
            </Text>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="w-full sm:w-1/2">
            {imageData === null ? (
              <div
                className="w-full h-[300px] bg-cyan-900/50 text-center justify-center items-center flex rounded-md cursor-pointer"
                {...dropzone.getRootProps()}
              >
                <div className="max-w-sm">
                  <input {...dropzone.getInputProps()} />
                  <p className="max-w-sm text-slate-400">
                    Drag and drop a PNG image, or click to select a file
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageData}
                  className="max-w-full aspect-auto rounded-md"
                  alt="Signed PNG"
                />
                <Button className="" tertiary onClick={downloadVerifiedPng}>
                  Download Image
                </Button>
              </>
            )}
          </div>
          <div className="w-full sm:w-1/2 flex flex-col gap-5">
            {verifiedPngData !== null && (
              <>
                <Text variant="Heading035">Verification complete</Text>
                <Text variant="Body02">This image contains the following verifications:</Text>
                {/* <Text variant="Body01">Your image has been updated with your signature.</Text> */}
                {verificationRows}
              </>
            )}
            {imageData !== null && verifiedPngData === null && (
              <>
                <Text variant="Heading05">No verifications were found on this image.</Text>
                {isSignedIn ? (
                  <>
                    <Button onClick={signFile}>Add your signature</Button>
                    {/* <Text variant="Body01">Add your signature</Text> */}
                  </>
                ) : (
                  <>
                    <Text variant="Body01">
                      If you&apos;d like to add your signature, first connect your wallet.
                    </Text>
                    <Button
                      onClick={async () => await openAuthRequest()}
                      disabled={isRequestPending}
                    >
                      {isRequestPending ? 'Connecting...' : 'Sign in'}
                    </Button>
                  </>
                )}
              </>
            )}
            {pngHash !== null && (
              <>
                <div className="flex flex-row gap-2 items-center">
                  <Text variant="Body02" color="$text-dim">
                    PNG Hash:{' '}
                  </Text>
                  <span className="font-mono text-gray-400 text-sm">
                    {truncateMiddle(bytesToHex(pngHash), 8)}
                  </span>
                  <DuplicateIcon
                    className="relative -top-[1px]"
                    clipboardText={bytesToHex(pngHash)}
                  />
                </div>
              </>
            )}
            {imageData === null && (
              <>
                <Text variant="Body01" color="$text-dim">
                  Upload a PNG image to get started.
                </Text>
                <Text className="underline cursor-pointer" onClick={fetchExample}>
                  Fetch an example
                </Text>
              </>
            )}
          </div>
        </div>
      </div>

      {/* <input type="file" name="file" onChange={onFile} />
      {pngHash !== null && <Beutton onClick={signFile}>Sign</Beutton>} */}
      {/* {verifiedPngData !== null && <img src={verifiedPngData} width="100px" height="100px" />} */}
    </Stack>
  );
};
