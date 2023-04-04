import { namesForAddressState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { stxAddressAtom } from '@store/micro-stacks';
import { currentAccountAtom } from '@store/micro-stacks';
import { networkAtom } from '@store/micro-stacks';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily, waitForAll, atomWithStorage } from 'jotai/utils';
import { generateGaiaHubConfigSync, getFile, putFile } from 'micro-stacks/storage';
import isEqual from 'lodash-es/isEqual';
import { atom } from 'jotai';

export enum AccountProgress {
  NotStarted = 'NotStarted',
  WrapperDeployed = 'WrapperDeployed',
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
}, isEqual);

export const accountProgressAtom = atomFamily((stxAddress: string) => {
  return atom(get => {
    const [names, progressData] = get(
      waitForAll([namesForAddressState(stxAddress), accountProgressStorageAtom(stxAddress)])
    );

    const name = names.coreName?.combined;

    if (name && progressData.name !== name) {
      // not started
      return {};
    }

    return progressData;
  });
}, isEqual);

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

// GAIA Storage

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
}, isEqual);
