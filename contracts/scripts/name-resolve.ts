import 'cross-fetch/polyfill';
import { config } from 'dotenv';
import { asciiToBytes } from 'micro-stacks/common';

import { BnsContractsClient, parseFqn } from '@bns-x/client';

config();

const contracts = new BnsContractsClient('mainnet');

async function run() {
  const [fqn] = process.argv.slice(2);

  const { name, namespace } = parseFqn(fqn);

  const info = await contracts.client.ro(
    contracts.bnsCore.nameResolve({
      name: asciiToBytes(name),
      namespace: asciiToBytes(namespace),
    })
  );

  if (!info.isOk) {
    console.log(`${fqn} is available`);
  }
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
