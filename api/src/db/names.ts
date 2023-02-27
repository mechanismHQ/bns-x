import type { BnsDb } from '@db';
import type { Name } from '@prisma/client';
import { convertNameBuff } from '~/contracts/utils';
import { nameObjectToHex } from '~/utils';

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
    const { NameOwnership, id, name, namespace, ...rest } = nameRow;
    const owner = NameOwnership[0]?.account ?? '';
    return {
      ...convertNameBuff({
        ...rest,
        name: name,
        namespace: namespace,
        id: Number(id),
      }),
      owner,
    };
  }
  return null;
}

export async function fetchBnsxNameOwner(name: string, namespace: string, db: BnsDb) {
  const nameRow = await fetchBnsxName(name, namespace, db);
  return nameRow?.owner ?? null;
}

function convertNameRow(nameRow: Name, owner: string) {
  const { id, name, namespace } = nameRow;
  return {
    ...convertNameBuff({
      name,
      namespace,
      id: Number(id),
    }),
    owner,
  };
}

async function fetchBnsxNamesByAddressRows(account: string, db: BnsDb) {
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

export async function fetchBnsxNamesByAddress(account: string, db: BnsDb) {
  const [primary, names] = await Promise.all([
    fetchBnsxPrimaryName(account, db),
    fetchBnsxNamesByAddressRows(account, db),
  ]);

  return {
    primary: primary?.name ? convertNameRow(primary.name, account) : null,
    names: names.map(n => convertNameRow(n.name!, account)),
  };
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
    name,
    namespace,
  });
  return full.decoded;
}
