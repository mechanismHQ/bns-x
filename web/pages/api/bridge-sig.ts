import type { NextApiRequest, NextApiResponse } from 'next';
import { parseFqn } from '@bns-x/core';
import { L1_ENABLED, ordinalsBaseUrl } from '@common/constants';
import { tupleCV, bufferCV, uintCV } from 'micro-stacks/clarity';
import { asciiToBytes, bytesToHex, hexToBytes } from 'micro-stacks/common';
import { makeClarityHash } from 'micro-stacks/connect';
import { signWithKey, createStacksPrivateKey } from 'micro-stacks/transactions';
import { signatureVrsToRsv } from '@common/utils';
import { createWrapperV2Signature } from '@pages/api/wrapper-sig-v2';
import { inscriptionContentForName } from '@bns-x/bridge';
import { err, ok } from 'neverthrow';

export type BridgeSignerResponseOk = {
  signature: string;
  wrapperId: string;
  migrateSignature: string;
};

export type BridgeSignerResponse = { error: string } | BridgeSignerResponseOk;

export type BridgeSignerRequest = {
  name: string;
  inscriptionId: string;
  sender: string;
};

async function fetchInscriptionContent(inscriptionId: string) {
  try {
    const baseUrl = ordinalsBaseUrl();
    const url = `${baseUrl}/content/${inscriptionId}`;
    const contentReq = await fetch(url);
    const content = await contentReq.text();
    return ok(content);
  } catch (error) {
    return err('Unable to fetch inscription');
  }
}

export async function bridgeSignerApi(
  req: NextApiRequest,
  res: NextApiResponse<BridgeSignerResponse>
) {
  const { sender, name: fqn, inscriptionId } = req.query as BridgeSignerRequest;
  // console.log('req.query', req.query);
  if (typeof inscriptionId !== 'string' || typeof fqn !== 'string' || typeof sender !== 'string') {
    return res.status(500).send({ error: 'Invalid inscription param' });
  }
  if (!L1_ENABLED) {
    return res.status(500).send({ error: 'L1 is not enabled' });
  }
  const contentResult = await fetchInscriptionContent(inscriptionId);
  if (contentResult.isErr()) {
    return res.status(500).send({ error: contentResult.error });
  }
  if (contentResult.value !== inscriptionContentForName(fqn)) {
    return res.status(400).send({ error: 'Invalid inscription' });
  }

  const { name, namespace } = parseFqn(fqn);

  const hashData = tupleCV({
    name: bufferCV(asciiToBytes(name)),
    namespace: bufferCV(asciiToBytes(namespace)),
    'inscription-id': bufferCV(hexToBytes(inscriptionId)),
  });
  const hash = bytesToHex(makeClarityHash(hashData));

  const signerKey = createStacksPrivateKey(process.env.WRAPPER_SIGNER_KEY!);

  const sig = await signWithKey(signerKey, hash);
  const signature = signatureVrsToRsv(sig.data);

  const migrateData = await createWrapperV2Signature(sender, fqn);

  return res.status(200).send({
    signature,
    wrapperId: migrateData.wrapperId,
    migrateSignature: migrateData.signature,
  });
}

export default bridgeSignerApi;
