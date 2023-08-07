import type { NextApiRequest, NextApiResponse } from 'next';
import { inscriptionContentForName, parseFqn, contracts, deployments } from '@bns-x/core';
import { getClarigenNodeClient, getNetwork, ordinalsBaseUrl } from '@common/constants';
import { contractFactory } from '@clarigen/core';
import { fetchBlocks } from 'micro-stacks/api';
import { tupleCV, bufferCV, uintCV } from 'micro-stacks/clarity';
import { asciiToBytes, bytesToHex, hexToBytes } from 'micro-stacks/common';
import { makeClarityHash } from 'micro-stacks/connect';
import { signWithKey, createStacksPrivateKey } from 'micro-stacks/transactions';
import { signatureVrsToRsv } from '@common/utils';

export type BridgeSignerResponseOk = {
  signature: string;
};

export async function bridgeSignerApi(req: NextApiRequest, res: NextApiResponse) {
  const inscriptionId = req.query.inscription;
  const fqn = req.query.name;
  if (typeof inscriptionId !== 'string' || typeof fqn !== 'string') {
    return res.status(500).send({ error: 'Invalid inscription param' });
  }
  const baseUrl = ordinalsBaseUrl();
  const url = `${baseUrl}/content/${inscriptionId}`;
  const contentReq = await fetch(url);
  const content = await contentReq.text();
  if (content !== inscriptionContentForName(fqn)) {
    return res.status(400).send({ error: 'Invalid inscription' });
  }

  const { name, namespace } = parseFqn(fqn);

  console.log('name', name);
  console.log('namespace', namespace);

  const clarigen = getClarigenNodeClient();
  const bridge = contractFactory(contracts.l1BridgeV1, deployments.l1BridgeV1.devnet);
  const hashFromContract = await clarigen.ro(
    bridge.hashWrapData({
      name: asciiToBytes(name),
      namespace: asciiToBytes(namespace),
      inscriptionId: hexToBytes(inscriptionId),
    })
  );
  console.log('hash from contract', bytesToHex(hashFromContract));
  // const isValid = await clarigen.ro(
  //   bridge.validateWrapSignature({
  //     signature: hexToBytes(signature),
  //     name: asciiToBytes(fqnParts.name),
  //     namespace: asciiToBytes(fqnParts.namespace),
  //     inscriptionId: hexToBytes(inscriptionId),
  //   })
  // );

  const hashData = tupleCV({
    name: bufferCV(asciiToBytes(name)),
    namespace: bufferCV(asciiToBytes(namespace)),
    'inscription-id': bufferCV(hexToBytes(inscriptionId)),
  });
  const hash = bytesToHex(makeClarityHash(hashData));
  console.log('hash computed', hash);

  const signerKey = createStacksPrivateKey(process.env.WRAPPER_SIGNER_KEY!);

  const sig = await signWithKey(signerKey, hash);
  const signature = signatureVrsToRsv(sig.data);

  return res.status(200).send({ signature });
}

export default bridgeSignerApi;
