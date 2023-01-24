import { getNodeUrl } from "../constants";
import { fetchName } from "micro-stacks/api";

export async function getNameDetailsApi(name: string, namespace: string) {
  const fqn = `${name}.${namespace}`;
  const res = await fetchName({ url: getNodeUrl(), name: fqn });

  return res;
}
