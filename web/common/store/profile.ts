import { atom } from 'jotai';
import { hashAtom } from './migration';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';
import { nameDetailsAtom } from '@store/names';
import { coreNodeInfoAtom } from '@store/api';
import { doesNamespaceExpire, parseFqn } from '@bns-x/client';

export const unwrapTxidAtom = hashAtom('unwrapTxid');

export const nameExpirationAtom = atomFamily((name?: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['name-expiration', name],
    queryFn() {
      if (typeof name === 'undefined') {
        return null;
      }
      const details = get(nameDetailsAtom(name));
      if (details === null) return null;
      const { namespace } = parseFqn(name);
      if (!doesNamespaceExpire(namespace)) return null;
      if (namespace === 'testable') return null; // testnet faucet namespace
      if (typeof details.expire_block === 'undefined') return null;
      const nodeInfo = get(coreNodeInfoAtom);
      if (typeof nodeInfo.burn_block_height !== 'number') return null;
      const blockDiff = details.expire_block - nodeInfo.burn_block_height;
      const timeDiff = blockDiff * 10 * 60 * 1000;
      const expireDate = new Date(new Date().getTime() + timeDiff);
      return [expireDate.getFullYear(), expireDate.getMonth(), expireDate.getDate()].join('-');
    },
  }))[0];
}, Object.is);
