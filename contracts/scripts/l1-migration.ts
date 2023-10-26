import 'cross-fetch/polyfill';
import { config } from 'dotenv';
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
} from 'micro-stacks/transactions';
import { c32addressDecode } from 'micro-stacks/crypto';
import {
  contracts,
  deployer,
  getControllerAddress,
  getNonce,
  network,
  networkKey,
} from './script-utils';
import { bytesToHex, hexToBytes } from 'micro-stacks/common';

const migrator = contracts.wrapperMigrator;

config();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const privateKey = process.env.DEPLOYER_KEY!;

const [signer] = process.argv.slice(2);

async function run() {
  console.log('Network:', networkKey);
  console.log('Signer:', signer);
  console.log('Migrator:', migrator.identifier);
  const controller = getControllerAddress(privateKey);
  console.log('Controller:', controller);
  console.log('Deployer:', deployer);

  const nonce = await getNonce();

  const proposalTx = await makeContractCall({
    ...contracts.bnsxExtensions.execute(contracts.proposalMigratorV2.identifier, controller),
    nonce,
    fee: 100000,
    network,
    senderKey: privateKey,
    anchorMode: AnchorMode.Any,
  });

  const migratorTx = await makeContractCall({
    ...contracts.wrapperMigratorV2.setSigners([
      {
        signer,
        enabled: true,
      },
    ]),
    nonce: nonce + 1,
    fee: 100000,
    network,
    senderKey: privateKey,
    anchorMode: AnchorMode.Any,
  });

  const bridgeTx = await makeContractCall({
    ...contracts.l1BridgeV1.updateSigner(signer),
    nonce: nonce + 2,
    fee: 100000,
    network,
    senderKey: privateKey,
    anchorMode: AnchorMode.Any,
  });

  if (networkKey !== 'devnet') {
    throw 'Safe exit';
  }

  console.log(await broadcastTransaction(proposalTx, network));
  console.log(await broadcastTransaction(migratorTx, network));
  console.log(await broadcastTransaction(bridgeTx, network));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
