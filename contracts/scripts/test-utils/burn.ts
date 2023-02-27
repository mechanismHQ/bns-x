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
import { ClarigenNodeClient } from '@clarigen/node';

const testUtils = contracts.testUtils;
const registry = contracts.bnsxRegistry;
const clarigen = new ClarigenNodeClient(network);

const privateKey = process.env.DEPLOYER_KEY!;

let [addr] = process.argv.slice(2);

if (!addr) {
  const priv = makeRandomPrivKey();
  addr = privateKeyToStxAddress(priv.data);
}

async function run() {
  const name = Math.ceil(Math.random() * 1000).toFixed(0);
  const primary = (await clarigen.ro(registry.getPrimaryNameProperties(addr)))!;
  console.log('Sending', primary);
  const tx = await makeContractCall({
    ...registry.mngBurn({
      id: primary.id,
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
