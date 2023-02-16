import { BnsDb, StacksDb } from '@db';
import { getNamesForAddress, getPrimaryNameId, getTotalNames } from '../src/fetchers/stacks-db';
import { registryContract } from '../src/contracts';
import { getContractParts } from '../src/utils';
import { fetchBnsxNamesByAddress } from '@db/names';

async function run() {
  const db = new StacksDb();
  const bnsDb = new BnsDb();
  await db.$connect();
  await bnsDb.$connect();

  const [deployer] = getContractParts(registryContract().identifier);

  const primary = await getPrimaryNameId(deployer, db);

  console.log('primary', primary);

  const owned = await fetchBnsxNamesByAddress(deployer, bnsDb);
  console.log(owned);

  const counts = await getTotalNames(db);
  console.log('counts', counts);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
