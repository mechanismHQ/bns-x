import type { NextApiRequest, NextApiResponse } from 'next';
import { asciiToBytes } from 'micro-stacks/common';
import {
  AnchorMode,
  broadcastTransaction,
  makeContractCall,
  PostConditionMode,
} from 'micro-stacks/transactions';
import { fetchAccountNonces } from 'micro-stacks/api';
import {
  getNetwork,
  getNetworkKey,
  getTestnetNamespace,
  testUtilsContract,
} from '@common/constants';
import { privateKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';

const network = getNetwork();

export async function faucetApi(req: NextApiRequest, res: NextApiResponse) {
  const { name, recipient } = req.query;
  const testUtils = testUtilsContract();

  if (testUtils === null) {
    return res.status(400).send({ error: 'Not available.' });
  }

  if (typeof name !== 'string' || typeof recipient !== 'string') {
    return res.status(400).send({ error: 'Missing name, recipient' });
  }

  const privateKey = process.env.FAUCET_KEY!;
  const networkKey = getNetworkKey();
  const version =
    networkKey === 'mainnet'
      ? StacksNetworkVersion.mainnetP2PKH
      : StacksNetworkVersion.testnetP2PKH;
  const faucetAddr = privateKeyToStxAddress(privateKey.slice(0, 64), version, true);

  const namespace = getTestnetNamespace();

  const zonefile = asciiToBytes(
    `$ORIGIN ${name}.${namespace}.\n$TTL 3600\n_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"\n\n`
  );

  const nonces = await fetchAccountNonces({
    url: network.getCoreApiUrl(),
    principal: faucetAddr,
  });

  const tx = await makeContractCall({
    ...testUtils.v1RegisterTransfer({
      namespace: asciiToBytes(namespace),
      name: asciiToBytes(name),
      recipient,
    }),
    network,
    nonce: nonces.last_executed_tx_nonce + 1,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    senderKey: privateKey,
    fee: 50000,
  });

  const result = await broadcastTransaction(tx, network, zonefile);
  if ('error' in result) {
    return res.status(500).send({ error: result });
  }

  return res.status(200).send(result);
}
export default faucetApi;
