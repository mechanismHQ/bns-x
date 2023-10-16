import { getDeployerBalance, getDeployerNonce } from '~/deployer/deploy';
import { getDeployerAddress } from '~/deployer/index';

async function run() {
  const deployerAddress = getDeployerAddress();
  console.log('deployerAddress', deployerAddress);
  const [balance, nonce] = await Promise.all([getDeployerBalance(), getDeployerNonce()]);
  console.log('balance', balance);
  console.log('nonce', nonce);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
