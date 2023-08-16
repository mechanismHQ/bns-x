import type { NextApiRequest, NextApiResponse } from 'next';
import { getBtcNetwork } from '@common/constants';
import { tupleCV, bufferCV } from 'micro-stacks/clarity';
import { bytesToHex } from 'micro-stacks/common';
import { makeClarityHash } from 'micro-stacks/connect';
import { signWithKey, createStacksPrivateKey } from 'micro-stacks/transactions';
import { signatureVrsToRsv } from '@common/utils';
import { inscriptionIdToBytes } from '@bns-x/bridge';
import { trpc } from '@store/api';
import { Address, OutScript } from '@scure/btc-signer';

export type BridgeUnwrapSignerResponseOk = {
  signature: string;
};

export type BridgeUnwrapSignerResponse = { error: string } | BridgeUnwrapSignerResponseOk;

export type BridgeUnwrapSignerRequest = {
  inscriptionId: string;
};

export async function bridgeSignerApi(
  req: NextApiRequest,
  res: NextApiResponse<BridgeUnwrapSignerResponse>
) {
  const { inscriptionId } = req.query as BridgeUnwrapSignerRequest;
  if (typeof inscriptionId !== 'string') {
    return res.status(500).send({ error: 'Invalid inscription param' });
  }
  const { owner } = await trpc.bridgeRouter.getInscriptionOwner.query({ inscriptionId });
  const output = OutScript.encode(Address(getBtcNetwork()).decode(owner));

  const data = tupleCV({
    owner: bufferCV(output),
    'inscription-id': bufferCV(inscriptionIdToBytes(inscriptionId)),
  });

  const hash = bytesToHex(makeClarityHash(data));
  const signerKey = createStacksPrivateKey(process.env.WRAPPER_SIGNER_KEY!);

  const sig = await signWithKey(signerKey, hash);
  const signature = signatureVrsToRsv(sig.data);

  return res.status(200).send({ signature });
}

export default bridgeSignerApi;
