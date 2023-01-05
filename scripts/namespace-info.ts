import "cross-fetch/polyfill";
import { NodeProvider } from "@clarigen/node";
import {
  projectFactory,
  DEPLOYMENT_NETWORKS,
  contractFactory,
} from "@clarigen/core";
import { contracts } from "./clarigen";
import { StacksMainnet } from "micro-stacks/network";
import {
  asciiToBytes,
  bytesToAscii,
  bytesToUtf8,
  hexToBytes,
} from "micro-stacks/common";
import {
  hexToCV,
  deserializeCV,
  cvToHex,
  stringAsciiCV,
  bufferCV,
} from "micro-stacks/clarity";
import { inspect } from "util";

const allNamespaces = [
  "btc",
  "stx",
  "id",
  "app",
  "stacks",
  "mega",
  "podcast",
  "miner",
  "mining",
  "fren",
  "citycoins",
  "trajan",
  "helloworld",
  "crashpunk",
  "stacking",
  "frens",
  "zest",
  "bitcoinmonkey",
  "megapont",
  "blockstack",
  "graphite",
  "spaghettipunk",
  "stacksparrot",
  "satoshible",
  "satoshibles",
  "acloud",
  "penis",
  "stacksparrots",
  // "Labubu",
];

const bns = contractFactory(
  contracts.bnsV1,
  "SP000000000000000000002Q6VF78.bns"
);

// contracts.bnsV1.non_fungible_tokens[0]

const provider = NodeProvider({
  network: new StacksMainnet(),
});

Uint8Array.prototype[inspect.custom] = function (this: Uint8Array) {
  return `Uint8Array.from([${this.join(",")}])`;
};

async function getNamespace(ns: string) {
  return provider.roOk(
    bns.getNamespaceProperties({
      namespace: asciiToBytes(ns),
    })
  );
}

async function getPriceFn(ns: string) {
  const namespace = await getNamespace(ns);
  const { priceFunction: pf, ...rest } = namespace.properties;
  // const pf = namespace.properties.priceFunction;
  // console.log(rest);
  console.log(ns, rest.lifetime);
  console.log(ns, Number(rest.lifetime) / (144 * 365));
  const row: any[] = [
    ns,
    pf.base,
    pf.coeff,
    pf.noVowelDiscount,
    pf.nonalphaDiscount,
    ...pf.buckets,
  ];
  console.log(row.map((n) => n.toString()).join(","));
}

async function run() {
  const allInfo = (
    await Promise.all(
      allNamespaces.map(async (ns) => {
        try {
          const meta = await getNamespace(ns);
          return meta;
        } catch (error) {
          console.log(`Error fetching ${ns}`);
          return undefined;
        }
      })
    )
  ).filter(Boolean);
  console.log(
    inspect(allInfo, {
      showHidden: false,
      maxArrayLength: null,
      maxStringLength: null,
      depth: null,
      colors: false,
    })
  );
  // await Promise.all([
  //   getPriceFn("btc"),
  //   getPriceFn("id"),
  //   getPriceFn("app"),
  //   getPriceFn("blockstack"),
  //   getPriceFn("mega"),
  // ]);
  // console.log(bytesToAscii(hexToBytes("6964")));
  // const btcNamespace = await getNamespace("btc");
  // console.log("btcNamespace", btcNamespace);
  // console.log(btcNamespace.properties.priceFunction);
  // const id = await getNamespace("id");
  // console.log("id", id);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
