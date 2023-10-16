import { hexToBytes } from '@noble/hashes/utils';
import { ordCardTemplate } from './card';
import { bytesToHex } from 'micro-stacks/common';
export * from './btc-networks';
export * from './burn-address';
export { ordCardTemplate } from './card';
import { fullDisplayName } from '@bns-x/punycode';

export const inscriptionJsSrc =
  '/content/1c0e770e0b28207a4e1b7f577b68940b36837f9046b95eef2694ab671a1dfdeei0';

export const inscriptionContentType = 'text/html;charset=utf-8';

/**
 *
 * @param namePuny the punycode fully-qualified name
 * @returns valid HTML to be used in an inscription
 */
export const inscriptionContentForName = (namePuny: string, customCardSource?: string) => {
  let template = ordCardTemplate;
  const name = fullDisplayName(namePuny);
  template = template.replace(/{{CARD_SRC}}/g, customCardSource ?? inscriptionJsSrc);
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
