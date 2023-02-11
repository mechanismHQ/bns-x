import { fetchInscription, verifyInscriptionZonefile } from '../src/fetchers/inscriptions';
import { parseZoneFile } from '@fungible-systems/zone-file';
import { getNameDetails } from '../src/fetchers';
import { getContractParts } from '../src/utils';
import { getZonefileInfo } from '../src/fetchers/zonefile';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { verifyMessageSignature, hashMessage } from 'micro-stacks/connect';
import { inspect } from 'util';

const inscriptionId = '0060f118cab1c3380b5a8edbbbb9fb9abaed548cf8de95e37f35cd69b3a159f9i0';

const zf = `
hank.btc - Bitcoin Name System
----------
$ORIGIN hank.btc.
$TTL 3600
_http._tcp	IN	URI	10	1	"https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"

_btc._addr	IN	TXT	"bc1qqx4xnlcqkavs2d0e8wnxnj95yv87z7209dfp4e"


----------
9de4bc060952ca79819fe4480272561ed38f3a953868f02918b49eb21a8e6ad87fdf236f781e970d895631e123b6f2e9756601544773e934c647dab74e6c4b9800
03145d8371fb09f59caa5918419da4677c900910689f86a9e9bd708562b5b601c5`;

const zonefileTrue =
  '$ORIGIN hank.btc.\n$TTL 3600\n_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"\n\n';

const larry =
  '$ORIGIN larry.btc.\n$TTL 3600\n_redirect\tIN\tURI\t10\t1\t"https://larrysalibra.com/"\n\n@\tIN\tA\t161.35.228.61\n\n_._nostr\tIN\tTXT\t"8a9cf8235533cf755be661170eed18e6a2006ec76a88c3fd7d21e6c13bb7b69d"\n\n';

async function run() {
  const inscription = await fetchInscription(inscriptionId);
  console.log(inscription);

  const zonefileInfo = await verifyInscriptionZonefile(zf);
  console.log('zonefileInfo', zonefileInfo);

  console.log(parseZoneFile(zonefileTrue));
  console.log(parseZoneFile(larry));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
