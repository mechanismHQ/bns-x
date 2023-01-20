import {
  afterAll,
  beforeAll,
  hexToBytes,
  bytesToHex,
  contractFactory,
  contractsFactory,
  FullContract,
  Chain,
  crypto,
} from "../deps.ts";
import { simnet } from "./clarigen-types.ts";
export * from "../deps.ts";
export * from "./clarigen.ts";
import { accounts } from "./clarigen.ts";

import { btcBytes, btcNamespace } from "./mocks.ts";
import { registerAllNamespaces } from "./bns-helpers.ts";

export const ASCII_ENCODING = new Uint8Array([0x61]);

export const alice = accounts.addr("wallet_1");
export const bob = accounts.addr("wallet_2");
export const charlie = accounts.addr("wallet_3");
export const deployer = accounts.addr("deployer");

const baseContracts = contractsFactory(simnet);
export const bns = contractFactory(
  {
    ...simnet.contracts.bnsV1,
    contractName: "SP000000000000000000002Q6VF78.bns",
  },
  "SP000000000000000000002Q6VF78.bns"
);

export type NameWrapper = FullContract<typeof contracts.nameWrapper>;

export const contracts = {
  ...baseContracts,
  bns,
};

export const registry = contracts.nameRegistry;
export const nftAsset = registry.non_fungible_tokens[0].name;
export const nftAssetId = `${registry.identifier}::${nftAsset}`;

export const utils = contracts.testUtils;

export function deploy() {
  const { chain, accounts } = Chain.fromSimnet(simnet);

  afterAll(() => {
    (Deno as any).core.opSync("api/v1/terminate_session", {
      sessionId: chain.sessionId,
    });
  });

  return {
    chain,
    accounts,
    bns,
    contracts,
  };
}

export function hash160(data: string) {
  const bytes = hexToBytes(data);
  const sha = crypto.subtle.digestSync("SHA-256", bytes);
  const ripe = crypto.subtle.digestSync("RIPEMD-160", sha);
  return new Uint8Array(ripe);
}

export function hashSalt(a: string, b: string) {
  // const aBytes = asciiToBytes(a);
  return hash160(`${bytesToHex(asciiToBytes(a))}${b}`);
}

export function hashFqn(name: string, namespace: string, salt: string) {
  const nameBytes = asciiToHex(name);
  const namespaceBytes = asciiToHex(namespace);
  return hash160(`${nameBytes}2e${namespaceBytes}${salt}`);
}

export function asciiToBytes(str: string) {
  const byteArray = [];
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xff);
  }
  return new Uint8Array(byteArray);
}

export function utf8ToBytes(str: string) {
  return new TextEncoder().encode(str);
}

export function bytesToUtf8(bytes: Uint8Array) {
  return new TextDecoder().decode(bytes);
}

export function asciiToHex(str: string) {
  return bytesToHex(asciiToBytes(str));
}

export function bytesToAscii(bytes: Uint8Array) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

export function signatureVrsToRsv(signature: string) {
  return hexToBytes(signature.slice(2) + signature.slice(0, 2));
}

export function deployWithNamespace() {
  const deployment = deploy();
  const { chain, bns, accounts } = deployment;
  const deployer = accounts.addr("deployer");

  beforeAll(() => {
    chain.txOk(
      contracts.executorDao.construct(contracts.proposalBootstrap.identifier),
      deployer
    );
    registerAllNamespaces(chain);
  });

  return deployment;
}

export function utilsRegisterBtc({
  name,
  owner,
  chain,
}: {
  chain: Chain;
  name: string;
  owner: string;
}) {
  return chain.txOk(
    utils.nameRegister({
      name: asciiToBytes(name),
      owner,
      namespace: btcBytes,
    }),
    deployer
  );
}
