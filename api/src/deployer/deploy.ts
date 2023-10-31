import type { StacksDb } from '@db';
import { getContractsClient, getNetwork } from '~/constants';
import {
  getDeployerAddress,
  getDeployerKey,
  getUndeployedWrappers,
  wrapperDeployerLogger,
} from './index';
import { AnchorMode, makeContractDeploy, broadcastTransaction } from 'micro-stacks/transactions';
import { getContractParts } from '~/utils';
import { fetchAccountNonces, fetchAccountBalances } from 'micro-stacks/api';
import { logger as _logger } from '~/logger';

export function getNameWrapperCode() {
  const client = getContractsClient();
  return client.nameWrapperCode;
}

export async function getDeployerNonce() {
  const address = getDeployerAddress();
  const nonces = await fetchAccountNonces({
    principal: address,
    url: getNetwork().getCoreApiUrl(),
  });
  return nonces.possible_next_nonce;
}

export async function getDeployerBalance() {
  const address = getDeployerAddress();
  // const client = getContractsClient();
  const url = `${getNetwork().getCoreApiUrl()}/extended/v1/address/${address}/balances`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    stx: {
      balance: string;
    };
  };
  const balance = BigInt(data.stx.balance);
  return balance;
}

export const DEPLOY_FEE = 100000n;

export async function deployWrapper({ wrapperId, nonce }: { wrapperId: string; nonce: number }) {
  const code = getNameWrapperCode();
  const [_, contractName] = getContractParts(wrapperId);
  const network = getNetwork();
  const tx = await makeContractDeploy({
    codeBody: code,
    contractName,
    senderKey: getDeployerKey(),
    nonce,
    anchorMode: AnchorMode.Any,
    fee: DEPLOY_FEE,
    network,
  });
  const result = await broadcastTransaction(tx, network);
  if (typeof result === 'string') {
    wrapperDeployerLogger.error(
      {
        wrapperId,
        contractName,
        error: result,
        msg: 'Error deploying wrapper',
      },
      'Error deploying wrapper'
    );
    return false;
  }
  if ('error' in result) {
    wrapperDeployerLogger.error(
      {
        wrapperId,
        contractName,
        ...result,
        msg: 'Error deploying wrapper',
      },
      'Error deploying wrapper'
    );
    return false;
  }
  wrapperDeployerLogger.info(
    {
      wrapperId,
      txid: result.txid,
      msg: 'Deployed wrapper',
    },
    'Deployed wrapper'
  );
  return true;
}

export async function deployWrappers(db: StacksDb) {
  const undeployedWrappers = await getUndeployedWrappers(db);
  const state = await Promise.all([getDeployerNonce(), getDeployerBalance()]);
  let [nonce] = state;
  const balance = state[1];
  wrapperDeployerLogger.debug(
    {
      wrappers: undeployedWrappers.map(w => w.wrapper_id),
      total: undeployedWrappers.length,
      balance: Number(balance),
      nonce,
    },
    'Deploying wrappers'
  );
  if (balance < DEPLOY_FEE * BigInt(undeployedWrappers.length)) {
    wrapperDeployerLogger.error(
      {
        total: undeployedWrappers.length,
        balance: Number(balance),
        nonce,
        topic: 'insufficient-deployer-balance',
      },
      'Insufficient balance to deploy wrappers'
    );
    return;
  }
  for (const wrapper of undeployedWrappers) {
    const ok = await deployWrapper({ wrapperId: wrapper.wrapper_id, nonce });
    if (ok) {
      nonce += 1;
    }
  }
}
