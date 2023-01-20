import {
  hashFqn,
  bns,
  asciiToBytes,
  hashSalt,
  bytesToAscii,
  contracts,
  NameWrapper,
} from "./helpers.ts";
import { accounts, simnet } from "./clarigen-types.ts";
import { nameWrapperCode } from "./mocks/wrapper.ts";
import { Chain, Tx, contractFactory, hexToBytes, txOk } from "../deps.ts";

const deployer = accounts.deployer.address;

export const asciiCost = 2000000n;

const validAsciiCharsStr = "abcdefghijklmnopqrstuvwxyz0123456789-_";
export const validAsciiChars = validAsciiCharsStr.split("");

export function randomAscii() {
  const max = 255;
  return String.fromCharCode(Math.floor(Math.random() * max));
}

const maxAsciiSize = 48;
export function randomName({
  length,
  allowInvalid,
}: {
  length?: number;
  allowInvalid?: boolean;
} = {}) {
  const len = length || Math.floor(Math.random() * maxAsciiSize + 1);
  let name = "";
  for (let i = 0; i < len; i++) {
    const charIndex = Math.floor(Math.random() * validAsciiChars.length);
    const char = validAsciiChars[charIndex];
    name += char;
  }
  return name;
}

export function randomNamespace() {
  const nsIndex = Math.floor(Math.random() * allNamespacesRaw.length);
  return allNamespacesRaw[nsIndex];
}

export function registerNameV1({
  chain,
  name,
  owner,
  namespace = "btc",
}: {
  chain: Chain;
  name: string;
  owner: string;
  namespace?: string;
}) {
  const salt = "0000";
  const hashed = hashFqn(name, namespace, salt);

  chain.txOk(
    bns.namePreorder({
      stxToBurn: asciiCost,
      hashedSaltedFqn: hashed,
    }),
    owner
  );

  return chain.txOk(
    bns.nameRegister({
      name: asciiToBytes(name),
      namespace: asciiToBytes(namespace),
      salt: hexToBytes(salt),
      zonefileHash: hexToBytes(""),
    }),
    owner
  );
}

export function deployWrapper(chain: Chain, id: string) {
  const [deployer, name] = id.split(".");
  const tx = Tx.deployContract(name, nameWrapperCode, deployer);
  (tx.deployContract as any).clarityVersion = 2;
  chain.chain.mineBlock([tx]);
  return wrapperFactory(id);
}

export function wrapperFactory(id: string) {
  return contractFactory(
    {
      ...simnet.contracts.nameWrapper,
      contractName: id,
    },
    id
  );
}

type NamespaceProps = typeof allNamespacesRaw[number];

type BNSContract = typeof bns;

export function registerNamespaceV1({
  namespaceProps,
}: {
  namespaceProps: NamespaceProps;
}) {
  const namespace = bytesToAscii(namespaceProps.namespace);
  const props = namespaceProps.properties;
  const salt = "0000";
  const hashed = hashSalt(namespace, salt);
  const v1 = contracts.bnsV1;

  const txs = [
    txOk(
      bns.namespacePreorder({
        stxToBurn: 640000000000,
        hashedSaltedNamespace: hashed,
      }),
      deployer
    ),

    txOk(
      bns.namespaceReveal(
        asciiToBytes(namespace),
        hexToBytes(salt),
        props.priceFunction.base,
        props.priceFunction.coeff,
        ...props.priceFunction.buckets,
        props.priceFunction.nonalphaDiscount,
        props.priceFunction.noVowelDiscount,
        props.lifetime,
        deployer
      ),
      deployer
    ),

    txOk(
      v1.namespacePreorder({
        stxToBurn: 640000000000,
        hashedSaltedNamespace: hashed,
      }),
      deployer
    ),

    txOk(
      v1.namespaceReveal(
        asciiToBytes(namespace),
        hexToBytes(salt),
        props.priceFunction.base,
        props.priceFunction.coeff,
        ...props.priceFunction.buckets,
        props.priceFunction.nonalphaDiscount,
        props.priceFunction.noVowelDiscount,
        props.lifetime,
        deployer
      ),
      deployer
    ),
  ];
  if (namespaceProps.properties.launchedAt !== null) {
    txs.push(txOk(v1.namespaceReady(namespaceProps.namespace), deployer));
    txs.push(txOk(bns.namespaceReady(namespaceProps.namespace), deployer));
  }
  return txs;
}

export function registerAllNamespaces(chain: Chain) {
  const transactions = allNamespacesRaw
    .map((nsProps) => {
      return registerNamespaceV1({ namespaceProps: nsProps });
    })
    .flat();
  return chain.mineBlock(...transactions);
}

export const allNamespacesRaw = [
  {
    namespace: Uint8Array.from([98, 116, 99]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 262800n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 1000n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 200n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([115, 116, 120]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([105, 100]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 52595n,
      namespaceImport: "SP364R1Y0XYC8PYXEK0PE3V752RAJB2GNWF28WP90",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([97, 112, 112]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([115, 116, 97, 99, 107, 115]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([109, 101, 103, 97]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71814n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71814n,
    },
  },
  {
    namespace: Uint8Array.from([112, 111, 100, 99, 97, 115, 116]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SPHYHD2ZJ11HWRDKVZ160QX7FD7PCVNT2N9CT2H6",
      priceFunction: {
        base: 40n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 10833n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([109, 105, 110, 101, 114]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 1n,
        buckets: [
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 0n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([109, 105, 110, 105, 110, 103]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([102, 114, 101, 110]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71814n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71814n,
    },
  },
  {
    namespace: Uint8Array.from([99, 105, 116, 121, 99, 111, 105, 110, 115]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71810n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71810n,
    },
  },
  {
    namespace: Uint8Array.from([116, 114, 97, 106, 97, 110]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 74966n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 74966n,
    },
  },
  {
    namespace: Uint8Array.from([
      104, 101, 108, 108, 111, 119, 111, 114, 108, 100,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP3TJ4WRTXW0YFWF1TWKWCG7E6Z6MZDTWAVB6SW5V",
      priceFunction: {
        base: 2n,
        buckets: [
          15n,
          14n,
          13n,
          12n,
          11n,
          10n,
          9n,
          8n,
          7n,
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
        ],
        coeff: 173n,
        noVowelDiscount: 5n,
        nonalphaDiscount: 2n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([99, 114, 97, 115, 104, 112, 117, 110, 107]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71814n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71814n,
    },
  },
  {
    namespace: Uint8Array.from([115, 116, 97, 99, 107, 105, 110, 103]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP24TC3Y58XKHZ7GX0N69X50BFYD9ECSR8PGAE3H6",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([102, 114, 101, 110, 115]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 70971n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v1",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 70971n,
    },
  },
  {
    namespace: Uint8Array.from([122, 101, 115, 116]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 82088n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 82088n,
    },
  },
  {
    namespace: Uint8Array.from([
      98, 105, 116, 99, 111, 105, 110, 109, 111, 110, 107, 101, 121,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71806n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71806n,
    },
  },
  {
    namespace: Uint8Array.from([109, 101, 103, 97, 112, 111, 110, 116]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 70971n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v1",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 70971n,
    },
  },
  {
    namespace: Uint8Array.from([98, 108, 111, 99, 107, 115, 116, 97, 99, 107]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 0n,
      namespaceImport: "SP355AMV5R2A5C7VQCF4YPPAS05W93HTB68574W7S",
      priceFunction: {
        base: 4n,
        buckets: [
          7n,
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([103, 114, 97, 112, 104, 105, 116, 101]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 0n,
      lifetime: 52595n,
      namespaceImport: "SP3X2W6GTGVVG9RW78F1MT7M9AQFS2HWV2JETXPG2",
      priceFunction: {
        base: 4n,
        buckets: [
          6n,
          5n,
          4n,
          3n,
          2n,
          1n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
          0n,
        ],
        coeff: 10833n,
        noVowelDiscount: 4n,
        nonalphaDiscount: 4n,
      },
      revealedAt: 0n,
    },
  },
  {
    namespace: Uint8Array.from([
      115, 112, 97, 103, 104, 101, 116, 116, 105, 112, 117, 110, 107,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 75870n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 75870n,
    },
  },
  {
    namespace: Uint8Array.from([
      115, 116, 97, 99, 107, 115, 112, 97, 114, 114, 111, 116,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71814n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71814n,
    },
  },
  {
    namespace: Uint8Array.from([
      115, 97, 116, 111, 115, 104, 105, 98, 108, 101,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 71810n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v2",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 71810n,
    },
  },
  {
    namespace: Uint8Array.from([
      115, 97, 116, 111, 115, 104, 105, 98, 108, 101, 115,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 70971n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v1",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 70971n,
    },
  },
  {
    namespace: Uint8Array.from([
      115, 116, 97, 99, 107, 115, 112, 97, 114, 114, 111, 116, 115,
    ]),
    properties: {
      canUpdatePriceFunction: true,
      launchedAt: 70971n,
      lifetime: 52560n,
      namespaceImport:
        "SPC0KWNBJ61BDZRPF3W2GHGK3G3GKS8WZ7ND33PS.community-handles-v1",
      priceFunction: {
        base: 999999999999999999999999999999n,
        buckets: [
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
          1n,
        ],
        coeff: 1n,
        noVowelDiscount: 1n,
        nonalphaDiscount: 1n,
      },
      revealedAt: 70971n,
    },
  },
] as const;
