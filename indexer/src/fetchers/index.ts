import {
  getLegacyName,
  getNameDetails as getNameDetailsQuery,
} from "./query-helper";
import { getAddressNamesApi, getNameDetailsApi } from "./stacks-api";
import { NameInfoResponse, NamesByAddressResponse } from "../routes/api-types";
import { StacksPrisma } from "../stacks-api-db/client";
import { getAddressNamesDb } from "./stacks-db";
import { Histogram } from "prom-client";

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
      address: query.owner,
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

const getAddressNamesHist = new Histogram({
  name: "fetch_address_names_seconds_hist",
  help: "Histogram for how long it takes to fetch names owned by an address",
  labelNames: ["hasBnsx", "hasLegacy"] as const,
});

export async function getAddressNames(
  address: string,
  db?: StacksPrisma
): Promise<NamesByAddressResponse> {
  const end = getAddressNamesHist.startTimer();
  const useDb = typeof db !== "undefined" && process.env.USE_DB === "1";
  const names: NamesByAddressResponse = useDb
    ? await getAddressNamesDb(address, db)
    : await getAddressNamesApi(address);

  end({
    hasBnsx: names.primaryProperties === null ? "false" : "true",
    hasLegacy: names.legacy === null ? "false" : "true",
  });
  return names;
}
