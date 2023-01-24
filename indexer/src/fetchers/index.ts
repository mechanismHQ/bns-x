import { getNameDetails as getNameDetailsQuery } from "./query-helper";
import { getNameDetailsApi } from "./stacks-api";
import { NameInfoResponse } from "../routes/api-types";

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
