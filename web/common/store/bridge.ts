import { atom } from 'jotai';
import type { BridgeSignerResponseOk } from '../../pages/api/bridge-sig';

export const bridgeInscriptionIdAtom = atom('');

export async function fetchSignatureForInscriptionId(inscriptionId: string, fqn: string) {
  const url = `/api/bridge-sig?inscription=${inscriptionId}&name=${fqn}`;
  const res = await fetch(url);
  const data = (await res.json()) as BridgeSignerResponseOk;
  return data.signature;
}

export const bridgeSignatureAtom = atom('');
