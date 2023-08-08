import { atom } from 'jotai';
import type { BridgeSignerResponse, BridgeSignerResponseOk } from '../../pages/api/bridge-sig';
import { hashAtom } from '@store/migration';

export const bridgeInscriptionIdAtom = atom('');

export async function fetchSignatureForInscriptionId({
  inscriptionId,
  fqn,
  recipient,
}: {
  inscriptionId: string;
  fqn: string;
  recipient: string;
}) {
  const url = `/api/bridge-sig?inscriptionId=${inscriptionId}&name=${fqn}&recipient=${recipient}`;
  const res = await fetch(url);
  const data = (await res.json()) as BridgeSignerResponse;
  if ('error' in data) {
    throw new Error(data.error);
  }
  return data;
}

export const bridgeSignatureAtom = atom('');

export const bridgeWrapTxAtom = hashAtom('bridgeTx');
