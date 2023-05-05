import React, { useCallback, useEffect, useMemo } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { loadable, useAtomCallback } from 'jotai/utils';
import { Stack } from '@nelson-ui/react';
import type { Verification } from '@bns-x/png';
import { PNG, hashPNG, DOMAIN, pngMessage, appendChunk, createVerificationChunk } from '@bns-x/png';
import { bytesToBase64, bytesToHex, hexToBytes } from 'micro-stacks/common';
import { useOpenSignMessage, useOpenSignStructuredMessage } from '@micro-stacks/react';
import { Beutton } from '@components/ui/beutton';
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
} from '@store/verified-inscriptions';
import { useVerifiedInscriptionDropzone } from '@common/hooks/use-verified-inscription-dropzone';
import Image from 'next/image';
import { Text } from '@components/text';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { CheckIcon } from '@components/icons/check';
import { truncateMiddle } from '@common/utils';
import { DuplicateIcon } from '@components/icons/duplicate';

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
  const { dropzone } = useVerifiedInscriptionDropzone();
  const verifications = useAtomValue(pngVerificationsState);

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
      {verifiedPngData === null ? (
        <div
          className="w-full h-[300px] bg-cyan-900/50 text-center justify-center items-center flex rounded-md"
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
        <div className="flex gap-8">
          <div className="w-full sm:w-80 max-h-[500px] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={verifiedPngData} className="max-w-full aspect-auto" alt="Signed PNG" />
          </div>
          <div className="grow flex gap-5 flex-col">
            <Text variant="Heading035">Verification complete</Text>
            <Text variant="Body02">This image contains the following verifications:</Text>
            {/* <Text variant="Body01">Your image has been updated with your signature.</Text> */}
            {verificationRows}
          </div>
        </div>
      )}

      {/* <input type="file" name="file" onChange={onFile} />
      {pngHash !== null && <Beutton onClick={signFile}>Sign</Beutton>} */}
      {/* {verifiedPngData !== null && <img src={verifiedPngData} width="100px" height="100px" />} */}
    </Stack>
  );
};
