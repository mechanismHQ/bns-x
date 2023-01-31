import type { NextApiRequest, NextApiResponse } from 'next';
import { contractPrincipalCV } from 'micro-stacks/clarity';
import { signWithKey, createStacksPrivateKey } from 'micro-stacks/transactions';
import { bytesToHex } from 'micro-stacks/common';
import { makeClarityHash } from 'micro-stacks/connect';
import { signatureVrsToRsv } from '../../common/utils';
import { fetchTransaction, txEndpoint } from 'micro-stacks/api';
import { getNetwork, getClarigenNodeClient, getContracts } from '../../common/constants';
import type {
  Transaction,
  MempoolTransaction,
  SmartContractTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { makeNameWrapper } from '@common/wrapper';

async function fetchDeploy(txid: string): Promise<SmartContractTransaction | null> {
  const network = getNetwork();
  const url = `${txEndpoint(network.getCoreApiUrl())}/${txid}?unanchored=true`;
  const res = await fetch(url);
  const tx = (await res.json()) as Transaction | MempoolTransaction;
  if (tx.tx_status !== 'success') return null;
  if (tx.tx_type !== 'smart_contract') return null;

  return tx;
}

export async function wrapperSignatureApi(req: NextApiRequest, res: NextApiResponse) {
  const txid = req.query.wrapper;
  if (typeof txid !== 'string') {
    return res.status(500).send({ error: 'Invalid wrapper param' });
  }

  const contracts = getContracts();
  const clarigen = getClarigenNodeClient();

  const signerKey = createStacksPrivateKey(process.env.WRAPPER_SIGNER_KEY!);

  const tx = await fetchDeploy(txid);
  if (!tx) {
    return res.status(400).send({ error: 'Contract not found' });
  }

  // verify source code
  const contractId = tx.smart_contract.contract_id;
  const code = tx.smart_contract.source_code;
  const expected = makeNameWrapper();
  if (code !== expected) {
    console.warn('Attempted invalid name wrapper:', contractId);
    return res.status(429).send({ error: 'Invalid source code' });
  }

  const wrapperId = await clarigen.ro(contracts.wrapperMigrator.getIdFromWrapper(contractId));
  if (wrapperId === null) {
    console.warn('Name wrapper not registered:', contractId);
    return res.status(400).send({ error: 'Wrapper not registered' });
  }

  const buf = Buffer.alloc(16);
  buf.writeUintLE(Number(wrapperId), 0, 6);
  const hash = bytesToHex(hashSha256(Uint8Array.from(buf)));

  // const cv = contractPrincipalCV(deployer, contractName);
  // const hash = bytesToHex(makeClarityHash(cv));

  const sig = await signWithKey(signerKey, hash);

  const signature = signatureVrsToRsv(sig.data);
  console.log('Signing name wrapper:', contractId);

  return res.status(200).json({
    signature,
    contractId,
  });
}

export default wrapperSignatureApi;
