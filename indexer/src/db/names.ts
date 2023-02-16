import type { BnsDb, StacksDb } from '@db';
import { bytesToHex, asciiToBytes } from 'micro-stacks/common';
import { registryContractAsset } from '~/contracts';
import { decodeClarityValue } from 'stacks-encoding-native-js';
import { cvToHex, serializeCV, uintCV } from 'micro-stacks/clarity';

export async function queryNameId(prisma: BnsDb, name: string, namespace: string) {
  const nameHex = bytesToHex(asciiToBytes(name));
  const namespaceHex = bytesToHex(asciiToBytes(namespace));
  const row = await prisma.names.findFirst({
    where: {
      name: nameHex,
      namespace: namespaceHex,
    },
  });
}

export async function getNameOwnerById(id: bigint, db: StacksDb) {
  const assetId = registryContractAsset();
  const idCv = uintCV(id);
  const hex = serializeCV(idCv);
  const custodyRow = await db.nftCustody.findFirst({
    where: {
      assetIdentifier: assetId,
      value: Buffer.from(hex),
    },
  });
  return custodyRow?.recipient ?? null;
}
