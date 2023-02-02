import { StacksPrisma } from "../src/stacks-api-db/client";
import {
  getNamesForAddress,
  getPrimaryNameId,
} from "../src/fetchers/stacks-db";
import { registryContract } from "../src/contracts";
import { getContractParts } from "../src/utils";

async function run() {
  const db = new StacksPrisma();

  await db.$connect();

  const [deployer] = getContractParts(registryContract().identifier);

  const primary = await getPrimaryNameId(deployer, db);

  console.log("primary", primary);

  const owned = await getNamesForAddress(deployer, db);
  console.log(owned);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
