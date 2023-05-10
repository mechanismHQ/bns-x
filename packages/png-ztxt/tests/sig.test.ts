import { test, expect } from 'vitest';
import {
  Chunk,
  createSTXVerification,
  createVerificationChunk,
  decompressZTXt,
  getPngVerifications,
  pngMessageHash,
  recoverStacksAddress,
  signatureVrsToRsv,
  verifiedInscriptionData,
  verifyDecodedVerification,
  zTXtChunkData,
} from '../src';
import { hexToBytes } from '@noble/hashes/utils';
import { readPng } from './helpers';
import { compressPublicKey, makeRandomPrivKey, signWithKey } from 'micro-stacks/transactions';
import { hashMessage, verifyMessageSignature } from 'micro-stacks/connect';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { getPublicKeyFromStacksPrivateKey } from 'micro-stacks/transactions';
import {
  StacksNetworkVersion,
  getPublicKey,
  isCompressedPublicKey,
  publicKeyToStxAddress,
} from 'micro-stacks/crypto';

const hash = 'd51ea00e30106ed08cb7e48b6eaf752d843e217d9e7085bcf402c9176d5ba229';
const signature =
  '83a92c25b4463ee3ce075a1845bacf8d4d7ca8baf9fe7697460fb5b5afb3e613651dc81480ea9abdbcf20121a5957784d676ae257749ed28ce26ed81617cc8c401';

test('can recover stacks address correctly', () => {
  const address = recoverStacksAddress(hexToBytes(signature), hexToBytes(hash));
  expect(address).toEqual('SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2XG1V316');
});

test('creating a signature chunk', async () => {
  const chunk = createVerificationChunk('STX', hexToBytes(signature));
  const chunkBytes = Chunk.encode(chunk);
  expect(chunkBytes.length).toEqual(115);
});

test('invalidates bad signature', async () => {
  const png = await readPng('./data/signed.png');
  const verifications = getPngVerifications(png);
  expect(verifications.length).toEqual(0);
});

test('creating and verifying', async () => {
  const privateKey = makeRandomPrivKey();
  const message = 'hello world';
  const hash = hashMessage(message);
  const sig = await signWithKey(privateKey, bytesToHex(hash));
  const sigBytes = hexToBytes(signatureVrsToRsv(sig.data));
  const publicKey = getPublicKey(privateKey.data, true);
  const chunk = createSTXVerification({ signature: sigBytes, publicKey: publicKey });

  const verify = verifyMessageSignature({
    message: hash,
    publicKey: bytesToHex(publicKey),
    signature: bytesToHex(sigBytes),
  });
  expect(verify).toEqual(true);

  const chunkData = zTXtChunkData.decode(chunk.data);

  const decoded = verifiedInscriptionData.decode(decompressZTXt(chunkData));

  const result = verifyDecodedVerification(decoded, hash);
  expect(result).not.toEqual(false);
  const stxAddress = publicKeyToStxAddress(publicKey, StacksNetworkVersion.mainnetP2PKH);
  expect(result).toEqual({
    protocol: 'STX',
    address: stxAddress,
  });
});

test('verifying signed png file', async () => {
  const png = await readPng('./data/v2-signed.png');

  const verifications = getPngVerifications(png);

  expect(verifications[0]).toEqual({
    protocol: 'STX',
    address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
  });
});

test('converting connect payload to chunk', async () => {
  const hash = '1dafc7504d733e2329660a25de2f0fa3b74aef2a9d5af0c0157e1272bc8e8ad6';
  const message = pngMessageHash(hexToBytes(hash));
  const publicKey = '03145d8371fb09f59caa5918419da4677c900910689f86a9e9bd708562b5b601c5';
  const signature =
    '62f1d55d2ea37bb28a1bc629ab96b8dda43d126562ba6a3cc8f8201dd60003db6f7087463683e17580a47a79d13dcf18e5737fe31563df0c5eac9416ad117fe301';

  const sigBytes = hexToBytes(signature);
  const pubkeyBytes = hexToBytes(publicKey);

  const verified = verifyMessageSignature({
    message,
    publicKey: publicKey,
    signature: signature,
    // mode: 'vrs',
  });

  const verificationChunk = createSTXVerification({
    signature: sigBytes,
    publicKey: pubkeyBytes,
  });

  const chunkData = zTXtChunkData.decode(verificationChunk.data);

  const decoded = verifiedInscriptionData.decode(decompressZTXt(chunkData));

  const result = verifyDecodedVerification(decoded, message);
  if (result === false) {
    throw new Error('Expected verification');
  }
  expect(result).toEqual({
    protocol: 'STX',
    address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
  });
});
