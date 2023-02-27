import { ApiFetcher } from '@fetchers/adapters/api-fetcher';
import { parseZoneFile } from '@fungible-systems/zone-file';
import type { ZonefileRecords } from '@routes/api-types';
import { getContractParts } from '../utils';

export async function getZonefileInfo(zonefile: string) {
  const parsed = parseZoneFile(zonefile);
  const origin = parsed.$origin?.replace(/\.$/, '');

  const [name, namespace] = getContractParts(origin ?? '');
  const nameDetails = await new ApiFetcher().getNameDetails(`${name}.${namespace}`);

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

export function getZonefileProperties(zonefile: string): ZonefileRecords {
  try {
    const parsed = parseZoneFile(zonefile);

    const records: ZonefileRecords = {};

    parsed.txt?.forEach(txt => {
      if (txt.name === '_btc._addr') {
        records.btcAddress = txtRecordValue(txt.txt);
      }
      if (txt.name === '_._nostr') {
        records.nostr = txtRecordValue(txt.txt);
      }
    });
    return records;
  } catch (error) {
    return {};
  }
}

function txtRecordValue(val: string | string[]) {
  return typeof val === 'string' ? val : val[0];
}
