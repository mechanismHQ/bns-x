import { getContractsClient } from '@common/constants';

export function makeNameWrapper() {
  const client = getContractsClient();
  return client.nameWrapperCode;
}
