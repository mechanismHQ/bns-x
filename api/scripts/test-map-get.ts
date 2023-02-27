import { StacksMainnet } from 'micro-stacks/network';
import { registryContract } from '../src/contracts';
import { fetchMapGet } from '@clarigen/core';

async function run() {
  const network = new StacksMainnet();
  const registry = registryContract();

  const res = await fetchMapGet(
    registry.identifier,
    registry.maps.ownerPrimaryNameMap,
    'SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60',
    {
      network,
    }
  );
  console.log(res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
