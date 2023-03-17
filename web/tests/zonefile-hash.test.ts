import { hashSha256 } from 'micro-stacks/crypto-sha';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashRipemd160 } from 'micro-stacks/crypto';

const zf =
  '$ORIGIN hank.btc.\n$TTL 3600\n_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"\n\n_btc._addr\tIN\tTXT\t"bc1qultv5ks9qcyxxwcnkfmpdh4y9u0tpw6s4mng7v"\n\n';

test('zonefile hashing is correct', () => {
  const zonefileBytes = utf8ToBytes(zf);
  const hash = hashRipemd160(hashSha256(zonefileBytes));

  console.log(bytesToHex(hash));
});
