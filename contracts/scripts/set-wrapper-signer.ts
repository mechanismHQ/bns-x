import 'cross-fetch/polyfill';
import { StacksMocknet } from 'micro-stacks/network';
import { config } from 'dotenv';
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
} from 'micro-stacks/transactions';
import { c32addressDecode } from 'micro-stacks/crypto';
import { contracts, getControllerAddress, network, networkKey } from './script-utils';
import { bytesToHex, hexToBytes } from 'micro-stacks/common';

const migrator = contracts.wrapperMigrator;

config();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const privateKey = process.env.DEPLOYER_KEY!;

const [signer] = process.argv.slice(2);

async function run() {
  const [_v, hash] = c32addressDecode(signer);

  console.log('Network:', networkKey);
  console.log('Signer:', signer);
  console.log('Pubkey Hash:', bytesToHex(hash));
  console.log('Migrator:', migrator.identifier);
  const controller = getControllerAddress(privateKey);
  console.log('Controller:', controller);

  const tx = await makeContractCall({
    ...migrator.setSigners([
      {
        signer: hash,
        enabled: true,
      },
    ]),
    network,
    fee: 100000,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    senderKey: privateKey,
  });

  console.log('Nonce', tx.auth.spendingCondition.nonce);

  if (networkKey !== 'devnet') {
    throw 'Safe exit';
  }

  const res = await broadcastTransaction(tx, network);
  console.log('res', res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
