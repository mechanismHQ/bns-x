import { hexToBytes } from '@noble/hashes/utils';
import { ordCardTemplate } from './card';
import { bytesToHex } from 'micro-stacks/common';
export * from './btc-networks';
export * from './burn-address';
export { ordCardTemplate } from './card';

export const inscriptionJsSrc =
  '/content/488975d21f3d113ec5158b871b54a69f5a26c26f26e842d6f050099135827e97i0';

export const inscriptionContentType = 'text/plain';
export const inscriptionContentForName = (name: string) => {
  let template = ordCardTemplate;
  template = template.replace(/{{CARD_SRC}}/g, inscriptionJsSrc);
  template = template.replace(/{{CARD_NAME}}/g, name);
  return template;
};

export function inscriptionIdToBytes(inscriptionId: string) {
  const [txid, outIndexStr] = inscriptionId.split('i');
  // const txid = inscriptionId.slice(0, 32);
  const outIndex = parseInt(outIndexStr, 10);
  if (outIndex > 255) throw new Error('Inscription index must be less than 256');
  return new Uint8Array([...hexToBytes(txid), outIndex]);
}

export function bytesToInscriptionId(bytes: Uint8Array) {
  const txid = bytes.slice(0, 32);
  const outIndex = bytes[32];
  return `${bytesToHex(txid)}i${outIndex}`;
}
