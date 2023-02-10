import { parseZoneFile } from '@fungible-systems/zone-file';
import { getNameDetails } from '.';
import { getContractParts } from '../utils';

export async function getZonefileInfo(zonefile: string) {
  const parsed = parseZoneFile(zonefile);
  const origin = parsed.$origin?.replace(/\.$/, '');

  const [name, namespace] = getContractParts(origin ?? '');
  const nameDetails = await getNameDetails(name, namespace);

  if (nameDetails === null) {
    throw new Error('Unable to get name details');
  }

  const owner = nameDetails.address;
  return {
    parsed,
    zonefile,
    owner,
    name,
    namespace,
  };
}
