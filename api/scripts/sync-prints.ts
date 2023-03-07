import { BnsDbTypes, refreshMaterializedViews } from '@db';
import { StacksDb, BnsDb } from '@db';
import { syncPrints } from '~/sync/prints';

async function run() {
  const bnsDb = new BnsDb();
  const stacksDb = new StacksDb();
  await bnsDb.$connect();
  await stacksDb.$connect();

  await syncPrints({
    bnsDb,
    stacksDb,
    lookback: 1000,
  });

  await refreshMaterializedViews(bnsDb);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
