import { StacksNetworkVersion, privateKeyToStxAddress } from 'micro-stacks/crypto';
import { getNetworkKey } from '~/constants';
import { bnsContractAsset, registryContractAsset } from '~/contracts';
import type { StacksDb, BnsDb } from '~/db';
import { logger as _logger } from '~/logger';

export const wrapperDeployerLogger = _logger.child({
  topic: 'wrapper-deployer',
});

export type UndeployedWrappers = {
  wrapper_id: string;
};

export function isDeployerEnabled() {
  try {
    getDeployerKey();
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUndeployedWrappers(stacksDb: StacksDb) {
  const assetId = bnsContractAsset();
  const deployer = getDeployerAddress();
  const deployerQuery = `${deployer}.nw-%`;
  const rows = await stacksDb.$queryRaw<UndeployedWrappers[]>`
  select 
    recipient as wrapper_id
  from nft_custody_unanchored nft
  left outer join txs ON nft.recipient = smart_contract_contract_id
  where recipient like ${deployerQuery}
    and txs.tx_id is null
    and asset_identifier = ${assetId}
    order by nft.block_height asc
  limit 15;
  `;

  return rows;
}

export async function getPendingWrappers(stacksDb: StacksDb) {
  const deployer = getDeployerAddress();
  const deployerQuery = `${deployer}.nw-%`;
  const rows = await stacksDb.$queryRaw<(UndeployedWrappers & { status: number })[]>`
  select
    tx_id
    , status
    , smart_contract_contract_id as wrapper_id
  from txs
  where txs.smart_contract_contract_id like ${deployerQuery}
    and status != 1
  limit 1;
  `;

  return rows;
}

export function getDeployerKey() {
  const key = process.env.WRAPPER_DEPLOYER_KEY;
  if (!key) {
    throw new Error('Missing WRAPPER_DEPLOYER_KEY');
  }
  return key;
}

export function getDeployerAddress() {
  try {
    const privateKey = getDeployerKey();
    const networkKey = getNetworkKey();
    const version =
      networkKey === 'mainnet'
        ? StacksNetworkVersion.mainnetP2PKH
        : StacksNetworkVersion.testnetP2PKH;
    if (privateKey.length === 66) {
      const key = privateKey.slice(0, 64);
      const isCompressed = privateKey.slice(64) === '01';
      return privateKeyToStxAddress(key, version, isCompressed);
    }
    return privateKeyToStxAddress(privateKey, version, false);
  } catch (error) {
    wrapperDeployerLogger.error({ err: error }, 'Unable to get deployer address');
    throw new Error('Unable to get deployer address');
  }
}
