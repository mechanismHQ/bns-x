import { parseZoneFile, makeZoneFile } from '@fungible-systems/zone-file';

export type ZoneFileObject = ReturnType<typeof parseZoneFile>;

export enum ZonefileTxtKeys {
  BTC_ADDR = '_btc._addr',
  NOSTR = '_._nostr',
}

export class ZoneFile {
  zoneFileText: string;
  zoneFile: ZoneFileObject;

  constructor(body: string) {
    this.zoneFileText = body ?? '';
    try {
      const parsed = parseZoneFile(body);
      this.zoneFile = parsed;
    } catch (error) {
      this.zoneFile = {};
    }
  }

  private txtRecordValue(val: string | string[]) {
    return typeof val === 'string' ? val : val[0];
  }

  getTxtRecord(key: string) {
    let found: string | null = null;
    this.zoneFile.txt?.forEach(record => {
      if (record.name === key) {
        found = this.txtRecordValue(record.txt);
      }
    });
    return found;
  }

  get btcAddr() {
    return this.getTxtRecord(ZonefileTxtKeys.BTC_ADDR);
  }

  get nostr() {
    return this.getTxtRecord(ZonefileTxtKeys.NOSTR);
  }
}
