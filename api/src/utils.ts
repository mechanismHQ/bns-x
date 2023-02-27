import { asciiToBytes, bytesToAscii, bytesToHex, hexToBytes } from 'micro-stacks/common';

export function getContractParts(identifier: string): [string, string] {
  const [addr, name] = identifier.split('.');
  if (!addr || !name) {
    throw new Error(`Invalid contract ID: ${identifier}`);
  }
  return [addr, name];
}

export function asciiToHex(str: string) {
  return bytesToHex(asciiToBytes(str));
}

export function hexToAscii(str: string) {
  return bytesToAscii(hexToBytes(str));
}

export function nameObjectToHex(name: { name: string; namespace: string }) {
  return {
    name: asciiToHex(name.name),
    namespace: asciiToHex(name.namespace),
  };
}

export function getNameParts(fqn: string) {
  const parts = fqn.split('.');
  if (parts.length === 3) {
    return parts.slice(1) as [string, string];
  }
  if (parts.length !== 2) {
    throw new Error(`Invalid FQN. Received: ${fqn}`);
  }

  return parts as [string, string];
}

export interface ParsedName {
  subdomain?: string;
  name: string;
  namespace: string;
}

export function parseFqn(fqn: string): ParsedName {
  const parts = fqn.split('.');
  if (parts.length === 3) {
    const [subdomain, name, namespace] = parts as [string, string, string];
    return {
      subdomain,
      name,
      namespace,
    };
  }
  if (parts.length === 2) {
    const [name, namespace] = parts as [string, string];
    return {
      name,
      namespace,
    };
  }
  throw new Error(`Invalid name: ${fqn}`);
}
