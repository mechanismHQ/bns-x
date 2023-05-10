import { bufferCV, tupleCV } from 'micro-stacks/clarity';
import {
  getPublicKeyFromSignature,
  makeClarityHash,
  makeDomainTuple,
  makeStructuredDataHash,
  recoverSignature,
  hashMessage,
  verifyMessageSignature,
  encodeMessage,
} from 'micro-stacks/connect';
import { ChainID } from 'micro-stacks/network';
import * as P from 'micro-packed';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { StacksNetworkVersion, publicKeyToStxAddress } from 'micro-stacks/crypto';
import type { ChunkType, PNGFile } from './png';
import { PNG } from './png';
import { zTXtChunkData } from './png';
import { decompressZTXt, makeZTXtChunk } from './ztxt';
import { hashPNG } from './hash';

// export const VERSION = '0.1.0';
// export const APP = 'Verified Inscriptions';
export const VERSION = '1.0.0';
export const APP = 'Dots';
export const CHAIN_ID = ChainID.Mainnet;

export const DOMAIN = {
  version: VERSION,
  name: APP,
  chainId: CHAIN_ID,
};

// export const DOMAIN = {
//   version: '1.0.0',
//   name: 'Dots',
// };

export const VERIFIED_INSCRIPTION_KEYWORD = 'verified-inscription';

export function structuredDataRequest(pngHash: Uint8Array) {
  return {
    message: bufferCV(pngHash),
    domain: DOMAIN,
  };
}

export const MESSAGE_PREFIX = 'PNG_VERIFICATION:';
export const MESSAGE_PREFIX_BYTES = new TextEncoder().encode(MESSAGE_PREFIX);

/** Construct the message that will be hashed and signed
 *
 * The message format is: `PNG_VERIFICATION:{bytesToHex(pngHash)}`
 *
 * @param pngHash The sha256 hash of the PNG file
 */
export function pngMessage(pngHash: Uint8Array) {
  const messageString = `${MESSAGE_PREFIX}${bytesToHex(pngHash)}`;
  return messageString;
}

export function pngMessageHash(pngHash: Uint8Array) {
  return hashMessage(pngMessage(pngHash));
}

export function makeMessageHash(pngHash: Uint8Array) {
  const domain = makeClarityHash(makeDomainTuple(APP, VERSION, CHAIN_ID));
  const message = makeClarityHash(bufferCV(pngHash));
  return makeStructuredDataHash(domain, message);
}

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

export const verifiedInscriptionData = P.struct({
  protocol: P.cstring,
  version: P.U8,
  signatureData: P.bytes(null),
});

export const stxSignatureData = P.struct({
  publicKey: P.bytes(33),
  signature: P.bytes(null),
});

export type STXSignatureData = P.UnwrapCoder<typeof stxSignatureData>;

export type DecodedVerification = P.UnwrapCoder<typeof verifiedInscriptionData>;

export function recoverStacksAddress(_signature: Uint8Array, pngHash: Uint8Array) {
  const message = pngMessageHash(pngHash);
  const { signature, recoveryBytes } = recoverSignature({
    signature: bytesToHex(_signature),
    // mode,
  });
  const publicKey = getPublicKeyFromSignature({
    hash: message,
    signature,
    recoveryBytes,
  });
  const stxAddress = publicKeyToStxAddress(publicKey, StacksNetworkVersion.mainnetP2PKH);
  return stxAddress;
}

export function getVerificationChunks(png: PNGFile): DecodedVerification[] {
  const verifications: DecodedVerification[] = [];
  png.chunks.forEach(chunk => {
    if (chunk.type !== 'zTXt') {
      return;
    }
    const decoded = zTXtChunkData.decode(chunk.data);
    if (decoded.keyword !== VERIFIED_INSCRIPTION_KEYWORD) return;
    try {
      const verification = verifiedInscriptionData.decode(decompressZTXt(decoded));
      verifications.push(verification);
    } catch (error) {
      console.warn('WARN: Failed to decode verification');
    }
  });
  return verifications;
}

export interface Verification {
  protocol: string;
  address: string;
}

export function verifyDecodedVerification(
  verificationData: DecodedVerification,
  pngHash: Uint8Array
): Verification | false {
  const { protocol, signatureData } = verificationData;
  try {
    switch (protocol.toLowerCase()) {
      case 'stx': {
        const { publicKey, signature } = stxSignatureData.decode(signatureData);
        try {
          const verified = verifyMessageSignature({
            message: pngHash,
            publicKey: bytesToHex(publicKey),
            signature: bytesToHex(signature),
          });
          if (!verified) return false;
          const stxAddress = publicKeyToStxAddress(publicKey, StacksNetworkVersion.mainnetP2PKH);
          return { protocol, address: stxAddress };
        } catch (error) {
          return false;
        }
      }
      default: {
        console.warn(`Unable to verify protocol ${protocol}`);
      }
    }
  } catch (error) {
    console.warn(`Error when verifying ${protocol}`, protocol);
  }
  return false;
}

export function getPngVerifications(pngOrBytes: PNGFile | Uint8Array): Verification[] {
  const png = pngOrBytes instanceof Uint8Array ? PNG.decode(pngOrBytes) : pngOrBytes;
  const verifications = getVerificationChunks(png);
  const pngHashBase = hashPNG(png);
  const pngHash = pngMessageHash(pngHashBase);
  const verified = verifications
    .map(v => verifyDecodedVerification(v, pngHash))
    .filter((v): v is Verification => v !== false);
  return verified;
}

export function createVerificationChunk(protocol: string, signatureData: Uint8Array) {
  const sigData = verifiedInscriptionData.encode({
    protocol,
    version: 1,
    signatureData,
  });
  return makeZTXtChunk(VERIFIED_INSCRIPTION_KEYWORD, sigData);
}

export function createSTXVerification({
  signature,
  publicKey,
}: {
  signature: Uint8Array;
  publicKey: Uint8Array;
}) {
  const signatureData = stxSignatureData.encode({ signature, publicKey });
  return createVerificationChunk('STX', signatureData);
}
