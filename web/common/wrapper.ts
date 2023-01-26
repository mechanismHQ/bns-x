import { nameWrapperCode } from './wrapper-code';
import { getContracts, getBnsDeployer } from '@common/constants';
import { getContractParts } from '@common/utils';

export function makeNameWrapper() {
  const contracts = getContracts();
  const registryId = contracts.bnsxRegistry.identifier;
  const [addr] = getContractParts(registryId);
  const devnetDeployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

  // TODO: fix bns for mainnet
  const code = nameWrapperCode
    .replaceAll(devnetDeployer, addr)
    .replaceAll('ST000000000000000000002AMW42H', getBnsDeployer());
  return code;
}
