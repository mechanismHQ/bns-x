import 'cross-fetch/polyfill';
import { ClarigenNodeClient } from '@clarigen/node';
import { projectFactory, DEPLOYMENT_NETWORKS, contractFactory } from '@clarigen/core';
import { contracts } from '@bns-x/core';
import { StacksMainnet } from 'micro-stacks/network';
import { asciiToBytes, bytesToAscii, bytesToUtf8, hexToBytes } from 'micro-stacks/common';
import { hexToCV, deserializeCV, cvToHex, stringAsciiCV, bufferCV } from 'micro-stacks/clarity';
import { inspect } from 'util';

const allNamespaces = [
  'btc',
  'stx',
  'id',
  'app',
  'stacks',
  'mega',
  'podcast',
  'miner',
  'mining',
  'fren',
  'citycoins',
  'trajan',
  'helloworld',
  'crashpunk',
  'stacking',
  'frens',
  'zest',
  'bitcoinmonkey',
  'megapont',
  'blockstack',
  'graphite',
  'spaghettipunk',
  'stacksparrot',
  'satoshible',
  'satoshibles',
  'acloud',
  'penis',
  'stacksparrots',
  'sats',
  'ord',
  // "Labubu",
];

const bns = contractFactory(contracts.bnsV1, 'SP000000000000000000002Q6VF78.bns');

// contracts.bnsV1.non_fungible_tokens[0]

const provider = new ClarigenNodeClient(new StacksMainnet());

Uint8Array.prototype[inspect.custom] = function (this: Uint8Array) {
  return `Uint8Array.from([${this.join(',')}])`;
};

async function getNamespace(ns: string) {
  return provider.roOk(
    bns.getNamespaceProperties({
      namespace: asciiToBytes(ns),
    })
  );
}

type NamespacePropsResponse = Awaited<ReturnType<typeof getNamespace>>;
type NamespaceProps = Omit<NamespacePropsResponse, 'namespace'> & { namespace: string };

async function getPriceFn(ns: string) {
  const namespace = await getNamespace(ns);
  const { priceFunction: pf, ...rest } = namespace.properties;
  // const pf = namespace.properties.priceFunction;
  // console.log(rest);
  console.log(ns, rest.lifetime);
  console.log(ns, Number(rest.lifetime) / (144 * 365));
  const row: (string | bigint)[] = [
    ns,
    pf.base,
    pf.coeff,
    pf.noVowelDiscount,
    pf.nonalphaDiscount,
    ...pf.buckets,
  ];
  console.log(row.map(n => n.toString()).join(','));
}

async function run() {
  const allProps: NamespaceProps[] = [];

  await Promise.all(
    allNamespaces.map(async ns => {
      try {
        const meta = await getNamespace(ns);
        if (meta.properties.launchedAt === null) return;
        allProps.push({
          ...meta,
          namespace: bytesToAscii(meta.namespace),
        });
      } catch (error) {}
    })
  );

  // console.log(
  //   inspect(allProps, {
  //     showHidden: false,
  //     maxArrayLength: null,
  //     maxStringLength: null,
  //     depth: null,
  //     colors: false,
  //   })
  // );

  const namespaces: Record<string, NamespaceProps['properties']> = {};
  allProps.forEach(ns => {
    namespaces[ns.namespace] = ns.properties;
  });
  console.log(
    inspect(namespaces, {
      showHidden: false,
      maxArrayLength: null,
      maxStringLength: null,
      depth: null,
      colors: false,
    })
  );
  // console.log(JSON.stringify(namespaces, null, 2));
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
