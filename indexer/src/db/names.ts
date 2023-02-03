import type { PrismaClient } from '@prisma/client';
import { getDeployerAddr } from '../constants';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';

export async function queryNameId(prisma: PrismaClient, name: string, namespace: string) {
  // const rows = await prisma.$queryRaw`
  //   SELECT id from
  // `;
  const deployer = getDeployerAddr();
  const nameHex = bytesToHex(utf8ToBytes(name));
  const namespaceHex = bytesToHex(utf8ToBytes(namespace));
  const row = await prisma.printEvent.findFirst({
    where: {
      AND: [
        {
          value: {
            path: ['topic'],
            equals: 'new-name',
          },
        },
        {
          value: {
            path: ['name', 'name'],
            equals: nameHex,
          },
        },
        {
          value: {
            path: ['name', 'namespace'],
            equals: namespaceHex,
          },
        },
      ],
      contractId: `${deployer}.bnsx-registry`,
      // value: {

      // }
    },
  });
}
