import { nameWrapperCode } from './wrapper-code';
import { getContracts, getBnsDeployer, getContractsClient } from '@common/constants';
import { getContractParts } from '@common/utils';
import { BnsxContractsClient } from '@bns-x/client';

export function makeNameWrapper() {
  const client = getContractsClient();
  return client.nameWrapperCode;
}
