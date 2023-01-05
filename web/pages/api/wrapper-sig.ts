import type { NextApiRequest, NextApiResponse } from 'next';
import { contractPrincipalCV } from 'micro-stacks/clarity';
import { signWithKey, createStacksPrivateKey } from 'micro-stacks/transactions';
import { bytesToHex } from 'micro-stacks/common';
import { makeClarityHash } from 'micro-stacks/connect';
import { signatureVrsToRsv } from '../../common/utils';
import { fetchTransaction, txEndpoint } from 'micro-stacks/api';
import { getNetwork } from '../../common/constants';
import {
  Transaction,
  MempoolTransaction,
  SmartContractTransaction,
} from '@stacks/stacks-blockchain-api-types';

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

  const signerKey = createStacksPrivateKey(process.env.WRAPPER_SIGNER_KEY!);

  const tx = await fetchDeploy(txid);
  if (!tx) {
    return res.status(400).send({ error: 'Contract not found' });
  }
  // todo: verify source code
  const contractId = tx.smart_contract.contract_id;
  const [deployer, contractName] = contractId.split('.');

  const cv = contractPrincipalCV(deployer, contractName);

  const hash = bytesToHex(makeClarityHash(cv));
  const sig = await signWithKey(signerKey, hash);

  const signature = signatureVrsToRsv(sig.data);

  return res.status(200).json({
    signature,
    contractId,
  });
}

export default wrapperSignatureApi;
