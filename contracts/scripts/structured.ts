import { standardPrincipalCV, tupleCV } from "micro-stacks/clarity";
import { bytesToHex } from "micro-stacks/common";
import {
  makeClarityHash,
  makeDomainTuple,
  makeStructuredDataHash,
} from "micro-stacks/connect";
import { getPublicKey } from "micro-stacks/crypto";
import { makeRandomPrivKey, signWithKey } from "micro-stacks/transactions";

async function run() {
  const privateKey = makeRandomPrivKey();
  const domain = makeClarityHash(makeDomainTuple("migrator", "0.0.1", 1));
  const message = makeClarityHash(
    tupleCV({
      recipient: standardPrincipalCV(
        "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5"
      ),
    })
  );
  const hashBytes = makeStructuredDataHash(domain, message);
  console.log(bytesToHex(hashBytes));

  const signature = await signWithKey(privateKey, bytesToHex(hashBytes));
  console.log(signature.data);
  console.log("pubkey", bytesToHex(getPublicKey(privateKey.data, true)));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
