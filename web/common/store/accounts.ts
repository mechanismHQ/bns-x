import { namesForAddressState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { networkAtom } from '@store/micro-stacks';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily, waitForAll } from 'jotai/utils';
import { generateGaiaHubConfigSync, getFile } from 'micro-stacks/storage';
import isEqual from 'lodash-es/isEqual';

export enum AccountProgress {
  NotStarted = 'NotStarted',
  WrapperDeployed = 'WrapperDeployed',
  Done = 'Done',
  NoName = 'NoName',
}

export const PROGRESS_FILE = 'account-progress.json';

export interface AccountProgressNotStarted {
  wrapperTxid: undefined;
  migrationTxid: undefined;
}

export interface AccountProgressData {
  wrapperTxid?: string;
  migrationTxid?: string;
}

export async function getProgressFile(appPrivateKey: string): Promise<AccountProgressData | null> {
  const gaiaHubConfig = generateGaiaHubConfigSync({
    gaiaHubUrl: 'https://hub.blockstack.org',
    privateKey: appPrivateKey,
  });

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

export const accountProgressFileAtom = atomFamily((account: Account) => {
  return atomsWithQuery(_get => ({
    queryKey: ['account-progress-file', account.stxAddress],
    refetchInterval: 1000 * 60,
    queryFn: async () => {
      const progressData = await getProgressFile(account.appPrivateKey!);
      return progressData;
    },
  }))[0];
}, isEqual);

export const accountProgressAtom = atomFamily((account: Account) => {
  return atomsWithQuery(get => ({
    queryKey: ['account-progress', account.stxAddress],
    queryFn: () => {
      const [names, progressData] = get(
        waitForAll([namesForAddressState(account.stxAddress), accountProgressFileAtom(account)])
      );
      return {
        name: names.coreName,
        progress: progressData,
      };
    },
  }))[0];
}, isEqual);
