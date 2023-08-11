import { atom } from 'jotai';
import type { BridgeSignerResponse, BridgeSignerResponseOk } from '../../pages/api/bridge-sig';
import { hashAtom, txidQueryAtom } from '@store/migration';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { trpc } from '@store/api';
import { atomFamily } from 'jotai/utils';

export const bridgeInscriptionIdAtom = atom('');

export async function fetchSignatureForInscriptionId({
  inscriptionId,
  fqn,
  sender,
}: {
  inscriptionId: string;
  fqn: string;
  sender: string;
}) {
  const url = `/api/bridge-sig?inscriptionId=${inscriptionId}&name=${fqn}&sender=${sender}`;
  const res = await fetch(url);
  const data = (await res.json()) as BridgeSignerResponse;
  if ('error' in data) {
    throw new Error(data.error);
  }
  return data;
}

export const bridgeSignatureAtom = atom('');

export const bridgeWrapTxidAtom = hashAtom('bridgeTx');

export const bridgeWrapTxState = txidQueryAtom(bridgeWrapTxidAtom)[0];
export const submittedBridgeInscriptionIdAtom = hashAtom('bridgeInscription');

export const inscribedNamesAtom = atomsWithQuery(_get => ({
  queryKey: ['inscribedNames'],
  queryFn: async () => {
    const { results } = await trpc.bridgeRouter.inscribedNames.query();
    return results;
  },
}))[0];

export const inscriptionIdForNameAtom = atomFamily((fqn: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['inscriptionIdForName', fqn],
    queryFn: async () => {
      try {
        const result = await trpc.bridgeRouter.getInscriptionByName.query({ name: fqn });
        return result.inscriptionId;
      } catch (error) {
        return null;
      }
    },
  }))[0];
});
