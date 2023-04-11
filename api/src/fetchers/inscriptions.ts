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

export async function fetchInscription(inscriptionId: string): Promise<Inscription> {
  const res = await fetch(`https://ordinals.com/inscription/${inscriptionId}`);

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
