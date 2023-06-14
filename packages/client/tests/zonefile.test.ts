import { ZoneFile } from '../src/zonefile';
import { expect, test, describe } from 'vitest';

const _zonefileRaw =
  '$ORIGIN hank.btc.\n$TTL 3600\n_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"\n\n_btc._addr\tIN\tTXT\t"bc1qqx4xnlcqkavs2d0e8wnxnj95yv87z7209dfp4e"\n\n';

const zonefileRaw = `
$ORIGIN hank.btc.
$TTL 3600
_http._tcp  IN      URI     10      1       "https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"
_redirect  IN      URI     10      1       "https://example.com"

_btc._addr  IN      TXT     "bc1qqx4xnlcqkavs2d0e8wnxnj95yv87z7209dfp4e"
`;

// console.log(zonefileRaw);

describe('with hank.btc zonefile', () => {
  const zonefile = new ZoneFile(zonefileRaw);

  // console.log(zonefile.zoneFile);

  test('can parse zonefile correctly', () => {
    const btc = zonefile.btcAddr;
    expect(btc).toEqual('bc1qqx4xnlcqkavs2d0e8wnxnj95yv87z7209dfp4e');
  });

  test('returns URI correctly', () => {
    const uri = zonefile.zoneFile.uri?.[1];
    expect(uri?.target).toEqual('https://example.com');
  });
});
