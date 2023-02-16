import type { BnsDb } from '@db';
import { convertNameBuff } from '~/contracts/utils';
import { getNameParts, hexToAscii, nameObjectToHex } from '~/utils';

export async function fetchBnsxName(name: string, namespace: string, db: BnsDb) {
  const nameRow = await db.name.findUnique({
    where: {
      name_namespace: nameObjectToHex({ name, namespace }),
    },
    include: {
      NameOwnership: true,
    },
  });
  if (nameRow) {
    const { NameOwnership, id, ...rest } = nameRow;
    const owner = NameOwnership[0]?.account ?? '';
    return convertNameBuff({
      ...convertNameBuff({ ...rest, id: Number(id) }),
      owner,
    });
  }
  return null;
}

export async function fetchBnsxNameOwner(name: string, namespace: string, db: BnsDb) {
  const nameRow = await fetchBnsxName(name, namespace, db);
  return nameRow?.owner ?? null;
}

export async function fetchBnsxNamesByAddress(account: string, db: BnsDb) {
  const names = await db.nameOwnership.findMany({
    where: {
      account,
    },
    include: {
      name: true,
    },
  });
  return names;
}

export async function fetchBnsxPrimaryName(account: string, db: BnsDb) {
  const name = await db.primaryName.findUnique({
    where: {
      account,
    },
    include: {
      name: true,
    },
  });
  return name;
}

export async function fetchBnsxDisplayName(account: string, db: BnsDb) {
  const primary = await fetchBnsxPrimaryName(account, db);
  if (primary === null || primary.name === null) return null;
  const { name, namespace } = primary.name;
  const full = convertNameBuff({
    name: hexToAscii(name),
    namespace: hexToAscii(namespace),
  });
  return full.decoded;
}
