import { parseFqn } from '@bns-x/core';
import { getContracts } from '@common/constants';
import { signatureVrsToRsv } from '@common/utils';
import { contractPrincipalCV, principalCV, tupleCV } from 'micro-stacks/clarity';
import { asciiToBytes, bytesToHex } from 'micro-stacks/common';
import { makeClarityHash } from 'micro-stacks/connect';
import { hashRipemd160 } from 'micro-stacks/crypto';
import { createStacksPrivateKey, signWithKey } from 'micro-stacks/transactions';
import type { NextApiRequest, NextApiResponse } from 'next';

export type WrapperV2ResponseOk = {
  signature: string;
  wrapperId: string;
};

export type WrapperV2ResponseError = {
  error: string;
};

export type WrapperV2Response = WrapperV2ResponseOk | WrapperV2ResponseError;

export async function createWrapperV2Signature(sender: string, fqn: string) {
  const { name, namespace } = parseFqn(fqn);

  const nameBytes = new Uint8Array([
    ...asciiToBytes(name),
    ...asciiToBytes('.'),
    ...asciiToBytes(namespace),
  ]);

  const nameHash = hashRipemd160(nameBytes).slice(0, 10);

  const contracts = getContracts();

  // TODO: variable deployer
  const deployer = contracts.bnsxRegistry.identifier.split('.')[0]!;

  const wrapperId = `${deployer}.nw-${bytesToHex(nameHash)}`;

  const senderCv = principalCV(sender);

  const hashData = bytesToHex(
    makeClarityHash(
      tupleCV({
        wrapper: contractPrincipalCV(wrapperId),
        sender: senderCv,
      })
    )
  );

  const signerKey = createStacksPrivateKey(process.env.WRAPPER_SIGNER_KEY!);

  const sig = await signWithKey(signerKey, hashData);
  const signature = signatureVrsToRsv(sig.data);

  return {
    signature,
    wrapperId,
  };
}

export async function wrapperSignerV2Api(
  req: NextApiRequest,
  res: NextApiResponse<WrapperV2Response>
) {
  const fqn = req.query.name;
  const sender = req.query.sender;
  if (typeof fqn !== 'string' || typeof sender !== 'string') {
    return res.status(500).send({ error: 'Invalid params' });
  }

  const sigData = await createWrapperV2Signature(sender, fqn);

  return res.status(200).send(sigData);
}
