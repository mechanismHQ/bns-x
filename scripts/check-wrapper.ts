import "cross-fetch/polyfill";
import { contracts } from "./script-utils";
import { ClarigenNodeClient } from "@clarigen/node";
import { StacksMocknet } from "micro-stacks/network";
import { bytesToHex, hexToBytes } from "micro-stacks/common";
import { contracts as _contracts } from "../web/common/clarigen";
import { contractFactory } from "@clarigen/core";

const client = ClarigenNodeClient({
  network: new StacksMocknet(),
});

const [contractId, sig] = process.argv.slice(2);

async function run() {
  const migrator = contractFactory(
    _contracts.wrapperMigrator,
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-migrator-1671122293241"
  );
  // const migrator = contracts.wrapperMigrator;

  const isSigner = await client.ro(
    migrator.isValidSigner("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
  );
  console.log(isSigner);

  const isValid = await client.ro(
    migrator.verifyWrapper({
      wrapper: contractId,
      signature: hexToBytes(sig),
    })
  );

  console.log("isValid", isValid);

  const hash = await client.ro(migrator.hashPrincipal(contractId));
  console.log(bytesToHex(hash));

  const debug = await client.roOk(
    migrator.debugSignature(contractId, hexToBytes(sig))
  );
  console.log({
    ...debug,
    pubkeyHash: bytesToHex(debug.pubkeyHash),
  });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
