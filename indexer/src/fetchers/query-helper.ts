import type { IntegerType } from 'micro-stacks/common';
import { asciiToBytes, intToBigInt } from 'micro-stacks/common';
import { clarigenProvider, queryHelperContract, registryContract } from '../contracts/index';
import { QueryHelperName, QueryHelperLegacyName } from '../contracts/types';
import { convertLegacyDetailsJson, convertNameBuff } from '../contracts/utils';

export async function getAddressNames(address: string) {
  const helper = queryHelperContract();
  const clarigen = clarigenProvider();
  const allNames = await clarigen.ro(helper.getNames(address), {
    json: true,
  });

  const legacy = allNames.legacy === null ? null : convertNameBuff(allNames.legacy);

  const names = allNames.names.map(n => ({
    ...convertNameBuff(n),
    legacy: convertLegacyDetailsJson(n.legacy),
  }));
  const primary = names[0] ?? null;

  const nameStrings = names.map(n => n.combined);
  if (legacy) nameStrings.push(legacy.combined);

  return {
    legacy,
    nameProperties: names,
    nextId: allNames.nextId,
    primaryProperties: primary,
    primaryName: primary?.combined ?? null,
    names: nameStrings,
    displayName: nameStrings[0] ?? null,
  };
}

export async function getNameById(_id: IntegerType) {
  const id = intToBigInt(_id);
  const helper = queryHelperContract();
  const clarigen = clarigenProvider();
  const details = await clarigen.ro(helper.getBnsxName(id), { json: true });

  if (details === null) return null;
  return {
    ...convertNameBuff(details),
    id: Number(id),
    legacy: convertLegacyDetailsJson(details.legacy),
  };
}

export async function getNameDetails(name: string, namespace: string) {
  const helper = queryHelperContract();
  const clarigen = clarigenProvider();
  const details = await clarigen.ro(
    helper.getBnsxByName({
      name: asciiToBytes(name),
      namespace: asciiToBytes(namespace),
    }),
    { json: true }
  );
  if (details === null) return null;
  return {
    ...convertNameBuff(details),
    id: parseInt(details.id, 10),
    legacy: convertLegacyDetailsJson(details.legacy),
  };
}

export async function getLegacyName(address: string) {
  const helper = queryHelperContract();
  const clarigen = clarigenProvider();
  const props = await clarigen.ro(helper.getLegacyName(address), {
    json: true,
  });
  return props;
}

export async function getPrimaryName(address: string) {
  const registry = registryContract();
  const clarigen = clarigenProvider();
  const name = await clarigen.ro(registry.getPrimaryName(address), { json: true, latest: true });
  return name;
}
