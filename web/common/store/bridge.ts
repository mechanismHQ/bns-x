import { atom } from 'jotai';
import type { BridgeSignerResponse, BridgeSignerResponseOk } from '../../pages/api/bridge-sig';
import { hashAtom, txidQueryAtom } from '@store/migration';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { trpc } from '@store/api';
import { atomFamily } from 'jotai/utils';
import { makeClarityHash } from 'micro-stacks/connect';
import { principalCV, stringAsciiCV, tupleCV } from 'micro-stacks/clarity';
import { currentAccountAtom, stxAddressAtom } from '@store/micro-stacks';
import {
  bridgeContractState,
  bridgeRegistryContractState,
  clarigenAtom,
  networkKeyAtom,
} from '@store/index';
import {
  getBurnAddressForRecipient,
  getBurnOutputForRecipient,
  getBurnRedeemScriptForRecipient,
} from '@bns-x/bridge';
import { OutScript, Address } from '@scure/btc-signer';
import { getBtcNetwork } from '@common/constants';
import { equalBytes } from 'micro-packed';
import { bytesToHex } from 'micro-stacks/common';
import type { BridgeUnwrapSignerResponse } from '@pages/api/bridge-unwrap-sig';

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

export async function fetchUnwrapSignature({ inscriptionId }: { inscriptionId: string }) {
  const url = `/api/bridge-unwrap-sig?inscriptionId=${inscriptionId}`;
  const res = await fetch(url);
  const data = (await res.json()) as BridgeUnwrapSignerResponse;
  if ('error' in data) {
    throw new Error(data.error);
  }
  return data;
}

export const bridgeSignatureAtom = atom('');

export const bridgeWrapTxidAtom = hashAtom('bridgeTx');
export const bridgeUnwrapTxidAtom = hashAtom('bridgeUnwrapTx');

export const bridgeWrapTxState = txidQueryAtom(bridgeWrapTxidAtom)[0];
export const bridgeUnwrapTxState = txidQueryAtom(bridgeUnwrapTxidAtom)[0];
export const submittedBridgeInscriptionIdAtom = hashAtom('bridgeInscription');

export const inscribedNamesAtom = atomsWithQuery(_get => ({
  queryKey: ['inscribedNames'],
  queryFn: async () => {
    const { results } = await trpc.bridgeRouter.inscribedNames.query();
    return results;
  },
}))[0];

export const inscriptionForNameAtom = atomFamily((fqn: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['inscriptionForName', fqn],
    refetchInterval: 10000,
    queryFn: async () => {
      try {
        const result = await trpc.bridgeRouter.getInscriptionByName.query({ name: fqn });
        return result;
      } catch (error) {
        return null;
      }
    },
  }))[0];
});

export const inscriptionIdForNameAtom = atomFamily((fqn: string) => {
  return atom(get => {
    return get(inscriptionForNameAtom(fqn))?.inscriptionId ?? null;
  });
});

export const bridgeBurnAddressForRecipientState = atomFamily((recipient: string) => {
  return atom(get => {
    const networkKey = get(networkKeyAtom);
    return getBurnAddressForRecipient(recipient, networkKey);
  });
});

export const bridgeBurnScriptState = atom(get => {
  const account = get(currentAccountAtom);
  if (!account) return null;
  const address = account.stxAddress;
  return get(bridgeBurnAddressForRecipientState(address));
});

export const bridgeBurnAddressFromContract = atomFamily((recipient: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['bridgeBurnAddressFromContract'],
    queryFn: async () => {
      const bridge = get(bridgeContractState);
      const clarigen = get(clarigenAtom);
      const output = await clarigen.ro(bridge.generateBurnOutput(recipient));
      const address = Address(getBtcNetwork()).encode(OutScript.decode(output));
      return address;
    },
  }))[0];
});

export const registryExtensionState = atomsWithQuery(get => ({
  queryKey: ['registryExtension'],
  queryFn: async () => {
    const registry = get(bridgeRegistryContractState);
    const clarigen = get(clarigenAtom);
    const ext = await clarigen.ro(registry.getExtension());
    return ext;
  },
}))[0];

// dev tool for verifying client-side burn address generation
export const verifiedBurnAddressState = atom(async get => {
  const burn = get(bridgeBurnScriptState);
  const address = get(stxAddressAtom);
  const networkKey = get(networkKeyAtom);
  const bridge = get(bridgeContractState);
  if (!address || !burn) return null;
  const clarigen = get(clarigenAtom);
  const fromContract = get(bridgeBurnAddressFromContract(address));
  try {
    const output = getBurnOutputForRecipient(address, networkKey);
    if (burn !== fromContract) {
      const redeemContract = await clarigen.ro(bridge.generateBurnScript(address));
      const redeem = getBurnRedeemScriptForRecipient(address, networkKey);
      console.log('redeem', bytesToHex(redeem));
      console.log('redeemContract', bytesToHex(redeemContract));
      console.log('redeem equal?', equalBytes(redeem, redeemContract));
      console.log('redeem decoded', OutScript.decode(output));
      // const output = getBurnOutputForRecipient(address);
      // const outFromContract = await clarigen.ro(bridge.generateBurnOutput(address));

      // console.log('Output', bytesToHex(output));
      console.log('burn address mismatch', burn, fromContract);
    } else {
      // console.log('ok');
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
});
