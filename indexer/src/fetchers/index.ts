import {
  getLegacyName,
  getNameDetails as getNameDetailsQuery,
} from "./query-helper";
import { getAssetIds, getNameDetailsApi } from "./stacks-api";
import { NameInfoResponse } from "../routes/api-types";
import { fetchNamesByAddress } from "micro-stacks/api";
import { getNodeUrl } from "../constants";
import { clarigenProvider, registryContract } from "../contracts";
import { NamePropertiesJson } from "../contracts/types";
import { convertLegacyDetailsJson, convertNameBuff } from "../contracts/utils";

export async function getNameDetails(
  name: string,
  namespace: string
): Promise<NameInfoResponse | null> {
  try {
    const [api, query] = await Promise.all([
      getNameDetailsApi(name, namespace),
      getNameDetailsQuery(name, namespace),
    ]);
    if (query === null) {
      return {
        ...api,
        isBnsx: false,
      };
    }
    return {
      ...api,
      ...query,
      address: query?.owner,
      isBnsx: true,
    };
  } catch (error) {
    console.warn(
      `Error fetching name details for ${name}.${namespace}:`,
      error
    );
    return null;
  }
}

export async function getAddressNames(address: string) {
  const [_legacy, assetIds] = await Promise.all([
    getLegacyName(address),
    getAssetIds(address),
  ]);
  const clarigen = clarigenProvider();
  const registry = registryContract();

  const names = (
    await Promise.all(
      assetIds.map(async (id) => {
        const name = await clarigen.ro(registry.getNamePropertiesById(id), {
          json: true,
        });
        return name;
      })
    )
  )
    .filter((n): n is NamePropertiesJson => n !== null)
    .map((n) => convertNameBuff(n));
  const legacy =
    _legacy === null
      ? null
      : convertLegacyDetailsJson(convertNameBuff(_legacy));

  const nameStrings = names.map((n) => n.combined);
  if (legacy !== null) {
    nameStrings.push(legacy.combined);
  }
  const displayName = nameStrings[0] ?? null;

  const primaryProperties = names[0] ?? null;

  return {
    legacy,
    names: nameStrings,
    nameProperties: names,
    primaryProperties,
    displayName,
  };
}
