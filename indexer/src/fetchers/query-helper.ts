import { asciiToBytes } from "micro-stacks/common";
import { clarigenProvider, queryHelperContract } from "../contracts/index";
import { QueryHelperName, QueryHelperLegacyName } from "../contracts/types";
import { convertLegacyDetailsJson, convertNameBuff } from "../contracts/utils";

export async function getAddressNames(address: string) {
  const helper = queryHelperContract();
  const clarigen = clarigenProvider();
  const allNames = await clarigen.ro(helper.getNames(address), {
    json: true,
  });

  const legacy =
    allNames.legacy === null ? null : convertNameBuff(allNames.legacy);

  const names = allNames.names.map((n) => ({
    ...convertNameBuff(n),
    legacy: convertLegacyDetailsJson(n.legacy),
  }));
  const primary = names[0] || null;

  const nameStrings = names.map((n) => n.combined);
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
    legacy: convertLegacyDetailsJson(details.legacy),
  };
}
