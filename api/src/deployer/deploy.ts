import type { StacksDb } from '@db';
import { getContractsClient, getNetwork } from '~/constants';
import { getDeployerAddress, getDeployerKey, getUndeployedWrappers } from './index';
import { AnchorMode, makeContractDeploy, broadcastTransaction } from 'micro-stacks/transactions';
import { getContractParts } from '~/utils';
import { fetchAccountNonces } from 'micro-stacks/api';
import { logger as _logger } from '~/logger';

export const logger = _logger.child({
  topic: 'wrapper-deployer',
});

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
    fee: 300000,
    network,
  });
  const result = await broadcastTransaction(tx, network);
  if (typeof result === 'string') {
    logger.error(
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
    logger.error(
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
  logger.info(
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
  let nonce = await getDeployerNonce();
  logger.debug(
    {
      wrappers: undeployedWrappers.map(w => w.wrapper_id),
      total: undeployedWrappers.length,
      nonce,
    },
    'Deploying wrappers'
  );
  for (const wrapper of undeployedWrappers) {
    const ok = await deployWrapper({ wrapperId: wrapper.wrapper_id, nonce });
    if (ok) {
      nonce += 1;
    }
  }
}
