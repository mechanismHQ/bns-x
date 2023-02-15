/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { asciiToBytes } from 'micro-stacks/common';
import { privateKeyToStxAddress } from 'micro-stacks/crypto';
import {
  AnchorMode,
  broadcastTransaction,
  makeContractCall,
  makeRandomPrivKey,
  PostConditionMode,
} from 'micro-stacks/transactions';
import { network, contracts } from '../script-utils';

const testUtils = contracts.testUtils;

const privateKey = process.env.DEPLOYER_KEY!;

const priv = makeRandomPrivKey();
const addr = privateKeyToStxAddress(priv.data);

async function run() {
  const name = Math.ceil(Math.random() * 1000).toFixed(0);
  const tx = await makeContractCall({
    ...testUtils.nameRegister({
      name: asciiToBytes(name),
      namespace: asciiToBytes('testable'),
      owner: addr,
    }),
    senderKey: privateKey,
    anchorMode: AnchorMode.Any,
    network,
    postConditionMode: PostConditionMode.Allow,
  });

  const res = await broadcastTransaction(tx, network);
  console.log('res', res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
