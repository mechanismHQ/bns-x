import { fetch } from 'cross-fetch';
import type { Node } from 'node-html-parser';
import { parse } from 'node-html-parser';
import { inspect } from 'util';
import { toCamelCase } from '@clarigen/core';
import { parseZoneFile } from '@fungible-systems/zone-file';
import { getZonefileInfo } from './zonefile';
import { verifyMessageSignature, hashMessage } from 'micro-stacks/connect';
import { publicKeyToStxAddress } from 'micro-stacks/crypto';
import { z } from 'zod';
import { getNetworkKey } from '~/constants';
import { bytesToHex } from 'micro-stacks/common';
import { bytesToInscriptionId } from '@bns-x/bridge';

export interface InscriptionMeta {
  id: string;
  address: string;
  sat: string;
  outputValue: string;
  contentType: string;
  timestamp: string;
  genesisHeight: string;
  genesisFee: string;
  genesisTransaction: string;
  location: string;
  output: string;
  offset: string;
  content: string;
}

export const inscriptionSchema = z.object({
  id: z.string(),
  address: z.string(),
  sat: z.string(),
  outputValue: z.number(),
  contentType: z.string(),
  timestamp: z.number(),
  genesisHeight: z.number(),
  genesisFee: z.string(),
  genesisTransaction: z.string(),
  location: z.string(),
  output: z.string(),
  offset: z.string(),
  content: z.string(),
});

export type Inscription = z.infer<typeof inscriptionSchema>;

export function ordinalsBaseUrl() {
  const networkKey = getNetworkKey();
  if (networkKey === 'mainnet') {
    return 'https://ordinals.com';
  }
  return 'http://0.0.0.0:5002';
}

export async function fetchInscription(inscriptionId: string): Promise<Inscription> {
  const res = await fetch(`${ordinalsBaseUrl()}/inscription/${inscriptionId}`);

  const body = await res.text();

  const html = parse(body);

  const dl = html.querySelector('main dl')!;
  const meta = parseMeta(dl.childNodes);
  const content = await fetchInscriptionContent(inscriptionId);
  const metaJson = {
    ...meta,
    content,
  } as unknown as InscriptionMeta;
  return convertInscriptionMeta(metaJson);
}

export function convertInscriptionMeta(meta: InscriptionMeta): Inscription {
  const timestamp = new Date(meta.timestamp).getTime();
  return {
    ...meta,
    genesisHeight: parseInt(meta.genesisHeight, 10),
    timestamp,
    outputValue: parseInt(meta.outputValue, 10),
  };
}

function toCamel(key: string) {
  const parts = key.split(' ');
  let final = parts[0] ?? '';
  parts.slice(1).forEach(part => {
    final += part[0]?.toUpperCase();
    final += part.slice(1);
  });
  return final;
}

export function parseMeta(nodes: Node[]) {
  const meta: Record<string, string> = {};

  let key = '';
  for (const node of nodes) {
    const text = node.text.trim().replace(/(\r\n|\n|\r)/gm, '');
    if (key && text) {
      meta[toCamel(key)] = text;
      key = '';
    } else if (text) {
      key = text;
    }
  }
  return meta;
}

export async function fetchInscriptionContent(inscriptionId: string) {
  const res = await fetch(`https://ordinals.com/content/${inscriptionId}`);
  return res.text();
}

export function parseZonefile(content: string) {
  const parsed = parseZoneFile(content);
  return parsed;
}

export const inscriptionVerifyResultSchema = z.object({
  verified: z.boolean(),
  owner: z.string(),
  zonefile: z.string(),
  intro: z.string(),
  zonefileInfo: z.any(),
});

export type InscriptionVerifyResult = z.infer<typeof inscriptionVerifyResultSchema>;

export async function verifyInscriptionZonefile(content: string) {
  const [intro, zonefileRaw, sigParts] = content.split(/\r*\n-{3,}\r*\n/g);
  if (!zonefileRaw || !sigParts || !intro) {
    throw new Error('Invalid zonefile inscription');
  }
  const zonefile = zonefileRaw;
  const zonefileInfo = await getZonefileInfo(zonefile);

  const [signature, _pubKey] = sigParts.split(/\r*\n/).map(c => c.replaceAll(/\W*/g, ''));
  const verified = verifyMessageSignature({
    message: zonefile.replaceAll(/\r\n/g, '\n'),
    signature: signature ?? '',
    stxAddress: zonefileInfo.owner,
    // publicKey: pubKey,
  });

  return {
    verified,
    owner: zonefileInfo.owner,
    zonefile,
    intro,
    zonefileInfo,
  };
}

export type HiroInscriptionResponse = {
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  id: string;
  /**
   *
   * @type {number}
   * @memberof InscriptionResponse
   */
  number: number;
  /**
   *
   * @type {string | null}
   * @memberof InscriptionResponse
   */
  address: string | null;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  genesis_address: string;
  /**
   *
   * @type {number}
   * @memberof InscriptionResponse
   */
  genesis_block_height: number;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  genesis_block_hash: string;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  genesis_tx_id: string;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  genesis_fee: string;
  /**
   *
   * @type {number}
   * @memberof InscriptionResponse
   */
  genesis_timestamp: number;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  tx_id: string;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  location: string;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  output: string;
  /**
   *
   * @type {string | null}
   * @memberof InscriptionResponse
   */
  value: string | null;
  /**
   *
   * @type {string | null}
   * @memberof InscriptionResponse
   */
  offset: string | null;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  sat_ordinal: string;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  sat_rarity: string;
  /**
   *
   * @type {number}
   * @memberof InscriptionResponse
   */
  sat_coinbase_height: number;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  mime_type: string;
  /**
   *
   * @type {string}
   * @memberof InscriptionResponse
   */
  content_type: string;
  /**
   *
   * @type {number}
   * @memberof InscriptionResponse
   */
  content_length: number;
  /**
   *
   * @type {number}
   * @memberof InscriptionResponse
   */
  timestamp: number;
};

export async function fetchHiroInscription(
  inscriptionId: string
): Promise<HiroInscriptionResponse> {
  const res = await fetch(`https://api.hiro.so/ordinals/v1/inscriptions/${inscriptionId}`);
  const data = (await res.json()) as HiroInscriptionResponse;
  return data;
}

export async function fetchInscriptionOwner(inscriptionId: string) {
  const networkKey = getNetworkKey();
  if (networkKey === 'mainnet') {
    const { address } = await fetchHiroInscription(inscriptionId);
    return address;
  }
  const { address } = await fetchInscription(inscriptionId);
  return address;
}

export function inscriptionBuffToId(id: Uint8Array) {
  return bytesToInscriptionId(id);
}
