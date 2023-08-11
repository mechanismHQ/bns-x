import type { StacksDb } from '@db';
import { deserializeTuple } from '@fetchers/stacks-db';
import { getNetwork } from '~/constants';
import { convertNameBuff } from '~/contracts/utils';
import { DbQueryTag, dbQuerySummary, observeQuery } from '~/metrics';

export function getBnsSmartContractId(): string {
  const network = getNetwork();
  return network.isMainnet()
    ? 'SP000000000000000000002Q6VF78.bns::names'
    : 'ST000000000000000000002AMW42H.bns::names';
}

export async function fetchNameByAddressCore(db: StacksDb, address: string) {
  const done = observeQuery(DbQueryTag.NAME_BY_ADDRESS);
  const nameNft = await db.nftCustody.findFirst({
    where: {
      recipient: address,
      assetIdentifier: getBnsSmartContractId(),
    },
  });
  done();
  if (nameNft === null) return null;
  const nameData = deserializeTuple<{
    name: string;
    namespace: string;
  }>(nameNft);
  const name = convertNameBuff(nameData);
  return name.combined;
}

export async function fetchSubdomainsByAddress(db: StacksDb, address: string) {
  const done = observeQuery(DbQueryTag.SUBDOMAIN_BY_ADDRESS);
  const result = await db.subdomains.findFirst({
    where: {
      owner: address,
      canonical: true,
      microblock_canonical: true,
    },
    select: {
      fully_qualified_subdomain: true,
    },
    orderBy: {
      fully_qualified_subdomain: 'asc',
    },
  });
  done();
  return result?.fully_qualified_subdomain ?? null;
}

export async function fetchCoreNameByAddress(db: StacksDb, address: string) {
  const name = await fetchNameByAddressCore(db, address);
  if (name !== null) return name;
  return fetchSubdomainsByAddress(db, address);
}
