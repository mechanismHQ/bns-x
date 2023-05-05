import { useDropzone } from 'react-dropzone';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import {
  pngAtom,
  pngBytesAtom,
  pngHashAtom,
  pngSignatureAtom,
  verifiedPngAtom,
} from '@store/verified-inscriptions';
import { useOpenSignMessage } from '@micro-stacks/react';
import { appendChunk, createVerificationChunk, getPngVerifications, pngMessage } from '@bns-x/png';
import { hexToBytes } from 'micro-stacks/common';

export function useVerifiedInscriptionDropzone() {
  const { openSignMessage, isRequestPending } = useOpenSignMessage();

  const addSignature = useAtomCallback(
    useCallback((get, set, signature: string) => {
      set(pngSignatureAtom, signature);
      const sigBytes = hexToBytes(signature);
      const png = get(pngAtom)!;
      const verificationChunk = createVerificationChunk('STX', sigBytes);
      appendChunk(png, verificationChunk);
      set(verifiedPngAtom, png);
    }, [])
  );

  const signFile = useAtomCallback(
    useCallback(
      async (get, _set) => {
        const hash = get(pngHashAtom);
        if (!hash) return;
        await openSignMessage({
          message: pngMessage(hash),
          async onFinish(payload) {
            // set(pngSignatureAtom, payload.signature);
            await addSignature(payload.signature);
            // const png = get(pngAtom);
            // const sigBytes = hexToBytes(signature);
            // const verificationChunk = createVerificationChunk('STX', sigBytes);
            // appendChunk(png, verificationChunk);
            console.log('payload.signature', payload.signature);
          },
        });
      },
      [openSignMessage, addSignature]
    )
  );

  const onDrop = useAtomCallback(
    useCallback(
      (get, set, acceptedFiles: File[]) => {
        const [file] = acceptedFiles;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          set(pngBytesAtom, bytes);
          const png = get(pngAtom)!;
          const verifications = getPngVerifications(png);
          if (verifications.length > 0) {
            set(verifiedPngAtom, png);
          } else {
            await signFile();
          }
        };
        reader.readAsArrayBuffer(file);
      },
      [signFile]
    )
  );

  const dropzone = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/png': ['.png'],
    },
  });

  return {
    dropzone,
    signFile,
    isRequestPending,
  };
}
