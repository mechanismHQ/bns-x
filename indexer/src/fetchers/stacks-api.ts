import { fetch } from "cross-fetch";
import { getNodeUrl } from "../constants";
import { fetchName, fetchNamesByAddress } from "micro-stacks/api";
import { NonFungibleTokenHoldingsList } from "@stacks/stacks-blockchain-api-types";
import { cvToValue } from "@clarigen/core";
import {
  getContracts,
  registryContract,
  registryContractAsset,
} from "../contracts";
import { deserializeCV } from "micro-stacks/clarity";

export async function getNameDetailsApi(name: string, namespace: string) {
  const fqn = `${name}.${namespace}`;
  const res = await fetchName({ url: getNodeUrl(), name: fqn });

  return res;
}

export async function getAssetIds(address: string): Promise<number[]> {
  const urlBase = getNodeUrl();
  const params = new URLSearchParams({
    principal: address,
    unanchored: "true",
    asset_identifiers: registryContractAsset(),
  });
  const url = `${urlBase}/extended/v1/tokens/nft/holdings?${params}`;
  const res = await fetch(url);
  const data = (await res.json()) as NonFungibleTokenHoldingsList;
  return data.results
    .map((d) => {
      const bign = cvToValue<bigint>(deserializeCV(d.value.hex));
      return Number(bign);
    })
    .filter((n) => !Number.isNaN(n));
}
