import { namesForAddressState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { stxAddressAtom } from '@store/micro-stacks';
import { currentAccountAtom } from '@store/micro-stacks';
import { networkAtom } from '@store/micro-stacks';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily, waitForAll, atomWithStorage } from 'jotai/utils';
import { generateGaiaHubConfigSync, getFile, putFile } from 'micro-stacks/storage';
import { dequal } from 'dequal';
import { atom } from 'jotai';
import { txidQueryAtom, txState } from '@store/migration';

export enum AccountProgress {
  NotStarted = 'NotStarted',
  WrapperDeployed = 'WrapperDeployed',
  WrapperDeployPending = 'WrapperDeployPending',
  FinalizePending = 'FinalizePending',
  Done = 'Done',
  NoName = 'NoName',
}

export const PROGRESS_FILE = 'account-progress.json';

export function progressFilePath(name: string) {
  return `/account-progress/${name}.json`;
}

export function storageAtom<T>(key: string, defaultValue: T) {
  if (typeof window === 'undefined') {
    return atom(defaultValue);
  }
  return atomWithStorage(key, defaultValue);
}

export interface AccountProgressNotStarted {
  wrapperTxid: undefined;
  migrationTxid: undefined;
}

export interface AccountProgressData {
  wrapperTxid?: string;
  migrationTxid?: string;
  name?: string;
}

export function accountProgressFileQueryKey({
  account,
  name,
}: {
  account: Account;
  name?: string;
}) {
  return ['account-progress-file', account.stxAddress, name ?? ''];
}

export const accountProgressStorageAtom = atomFamily((stxAddress: string) => {
  const key = `account-progress-${stxAddress}`;
  return storageAtom<AccountProgressData>(key, {});
});

export const accountProgressAtom = atomFamily((stxAddress: string) => {
  return atom(get => {
    return get(accountProgressStorageAtom(stxAddress));
  });
});

export const accountProgressStatusState = atomFamily((stxAddress: string) => {
  return atom(get => {
    const { name, wrapperTxid, migrationTxid } = get(accountProgressAtom(stxAddress));
    if (typeof name === 'undefined') return AccountProgress.NoName;
    if (typeof wrapperTxid === 'undefined') {
      return AccountProgress.NotStarted;
    }
    if (typeof migrationTxid !== 'undefined') {
      const migrateTx = get(txState({ txid: migrationTxid }));
      if (migrateTx?.tx_status === 'success') {
        return AccountProgress.Done;
      }
      return AccountProgress.FinalizePending;
    }
    if (typeof wrapperTxid !== 'undefined') {
      const deployTx = get(txState({ txid: wrapperTxid }));
      if (deployTx?.tx_status === 'success') {
        return AccountProgress.WrapperDeployed;
      }
      return AccountProgress.WrapperDeployPending;
    }
    throw new Error('Unknown account progress state');
  });
});

export const currentAccountProgressAtom = atom(
  get => {
    const stxAddress = get(stxAddressAtom);
    if (!stxAddress) return;
    return get(accountProgressAtom(stxAddress));
  },
  (get, set, value: AccountProgressData) => {
    const stxAddress = get(stxAddressAtom);
    if (!stxAddress) return;
    set(accountProgressStorageAtom(stxAddress), value);
  }
);

/**
 *
 *
 * Gaia Storage (not used currently)
 *
 *
 */

export async function getProgressFile(appPrivateKey: string): Promise<AccountProgressData | null> {
  const gaiaHubConfig = generateGaiaHubConfigSync({
    gaiaHubUrl: 'https://hub.blockstack.org',
    privateKey: appPrivateKey,
  });
  console.log('gaiaHubConfig', gaiaHubConfig);

  const contents = await getFile(PROGRESS_FILE, {
    privateKey: appPrivateKey,
    gaiaHubConfig,
    decrypt: true,
    verify: false,
  });

  if (contents === null) {
    return null;
  }

  if (typeof contents !== 'string') {
    throw new Error('Could not get progress file');
  }

  return JSON.parse(contents) as AccountProgressData;
}

export async function saveProgressFile({
  appPrivateKey,
  // name,
  data,
}: {
  appPrivateKey: string;
  // name: string;
  data: AccountProgressData;
}) {
  const gaiaHubConfig = generateGaiaHubConfigSync({
    gaiaHubUrl: 'https://hub.blockstack.org',
    privateKey: appPrivateKey,
  });

  await putFile(PROGRESS_FILE, JSON.stringify(data), {
    contentType: 'application/json',
    encrypt: true,
    gaiaHubConfig,
    privateKey: appPrivateKey,
  });
}

export const accountProgressFileAtom = atomFamily(({ account }: { account: Account }) => {
  return atomsWithQuery(_get => ({
    queryKey: accountProgressFileQueryKey({ account }),
    refetchInterval: 1000 * 60,
    queryFn: async () => {
      const progressData = await getProgressFile(account.appPrivateKey!);
      return progressData;
    },
  }))[0];
}, dequal);
