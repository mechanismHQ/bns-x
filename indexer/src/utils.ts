export function getContractParts(identifier: string): [string, string] {
  const [addr, name] = identifier.split(".");
  if (!addr || !name) {
    throw new Error(`Invalid contract ID: ${identifier}`);
  }
  return [addr, name];
}
