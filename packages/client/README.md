# `@bns-x/client`

A library for interacting with BNS and BNSx. [Learn more](https://docs.bns.xyz).

This library has a few main components:

- `BNSApiClient` - an interface to the BNS API
- `BNSContractsClient` - an interface to all BNS and BNSx contracts
- A set of types and utility functions for working with BNS

<!-- TOC depthfrom:2 -->

- [Interacting with the BNS API](#interacting-with-the-bns-api)
  - [Create the API client](#create-the-api-client)
  - [Get the "display name" for an address](#get-the-display-name-for-an-address)
  - [Get details about a name](#get-details-about-a-name)
  - [Fetch multiple names owned by an address](#fetch-multiple-names-owned-by-an-address)
- [Interacting with BNS and BNSx contracts](#interacting-with-bns-and-bnsx-contracts)
  - [The BnsContractsClient](#the-bnscontractsclient)
  - [Interacting with specific contracts](#interacting-with-specific-contracts)
  - [Usage with Clarigen](#usage-with-clarigen)
  - [Examples of interacting with contracts:](#examples-of-interacting-with-contracts)
    - [BNS Core](#bns-core)
  - [Getting source code for a name wrapper contract](#getting-source-code-for-a-name-wrapper-contract)
- [Utility functions](#utility-functions)
  - [asciiToBytes and bytesToAscii](#asciitobytes-and-bytestoascii)
  - [randomSalt](#randomsalt)
  - [hashFqn](#hashfqn)
  - [parseFqn](#parsefqn)

<!-- /TOC -->

## Interacting with the BNS API

The default base URL for all API queries is `https://api.bns.xyz`.

### Create the API client

```ts
import { BnsApiClient } from '@bns-x/client';

const bns = new BnsApiClient();

// optionally, set base URL:
// new BnsApiClient('http://example.com');
```

### Get the "display name" for an address

Returns: `string | null`

The logic for returning a user's "display name" is:

1. If the user owns any BNS Core names, return that name
2. If the user has a subdomain, return that
3. If the user owns a BNSx name, return that name

```ts
const name = await bns.getDisplayName();
```

### Get details about a name

Returns: `NameInfoResponse`

```ts
const details = await bns.getNameDetails('example', 'btc');

// also can use a helper for a full name:
await bns.getNameDetailsFromFqn('example.btc');
```

If the name doesn't exist, the function returns `null`.

Returns:

- `address`: the owner of this name
- `expire_block`: the block height this name expires at
- `zonefile`: zonefile for the name
- `isBnsx`: a boolean indicating whether the name has migrated to BNSx

If the owner of the name has [inscribed their zonefile](https://bns.xyz), it also returns:

- `inscriptionId`: the ID of the inscription containing the zonefile
- `inscription`: object containing:
  - `blockHeight`: Bitcoin block height where the name was inscribed
  - `timestamp`: timestamp of the inscription's creation date
  - `txid`: Bitcoin txid where the inscription was created
  - `sat`: the "Sat" holding the inscription

If the name has been migrated to BNSx, this response also includes:

- `id`: the NFT ID (integer)
- `legacy`: information about the status of the "legacy" name
  - `owner`: the wrapper contract holding this name

### Fetch multiple names owned by an address

Returns: `NamesByAddressResponse`

If you want to fetch multiple names (both BNS and BNSx) owned by an address, you can use this function. Note that if you just want to show a name for an address, using `getDisplayName` will have better performance.

```ts
const allNames = await bns.getAddressNames(address);
```

The return type has these properties:

- `names` array of names (strings) the user owns
- `displayName` a single name to show for the user (see `getDisplayName`)
- `coreName` the address's BNS Core name, if they have one
- `primaryProperties`: The properties of the address's primary BNSx name (see `nameProperties`)
- `nameProperties`: properties for the address's BNSx names
  - `id`: numerical ID of the name
  - `combined`: the full name (ie `example.btc`)
  - `decoded`: if the name is punycode, this will return the UTF-8 version of the name
  - `name` and `namespace`: the separate parts of the name (ie `example` and `btc` for `example.btc`)

## Interacting with BNS and BNSx contracts

This package includes [clarigen](https://clarigen.dev) generated types and functions for interacting with BNS contracts.

### The `BnsContractsClient`

Create a new client by specifying the network you're using. It can be one of `mainnet`, `testnet`, or `devnet`. This is used to automatically set the correct contract identifier for your network.

For calling read-only functions, you can also specify a Stacks API endpoint as the second parameter.

```ts
import { BnsContractsClient } from '@bns-x/client';
// defaults to "mainnet"
export const contracts = new BnsContractsClient();

// new BnsContractsClient('testnet', 'https://stacks-node-api.testnet.stacks.co');
```

### Interacting with specific contracts

The contracts client includes getters for various BNSx and BNS contracts:

- `registry`: the main name registry contract for BNSx
- `queryHelper`: a contract that exposes various query-related helpers
- `legacyBns`: the BNS Core contract
- `upgrader`: the contract responsible for upgrading wrapped names to BNSx

### Usage with Clarigen

Refer to the [clarigen](https://clarigen.dev) docs for more information - but here are a few quick examples.

In each example, `contracts` refers to an instance of the `BnsContractsClient`.

**Generate a `ClarigenClient`**

```ts
import { ClarigenClient } from '@clarigen/web';
// Uses micro-stacks for network information
import { microStacksClient } from './micro-stacks';

export const clarigen = new Clarigen(microStacksClient);
```

**Call read-only functions**

[Learn more](https://clarigen.dev/docs/web/quick-start#call-read-only-functions)

```ts
const primaryName = await clarigen.ro(contracts.registry.getPrimaryName(address));

// `roOk` is a helper to automatically expect and scope to a function's `ok` type
const price = await clarigen.roOk(contracts.legacyBns.getNamePrice(nameBuff, namespaceBuff));
```

**Make transactions**

[Learn more](https://clarigen.dev/docs/web/quick-start#making-contract-call-transactions)

```tsx
import { useOpenContractCall } from '@micro-stacks/react';

const registry = contracts.registry;

export const TransferName = () => {
  const { openContractCall } = useOpenContractCall();
  const nameId = 1n;

  const makeTransfer = async () => {
    await openContractCall({
      ...registry.transfer({
        id: nameId,
        sender: 'SP123...',
        recipient: 'SP123...',
      }),
      // ... include other tx args
      async onFinish(data) {
        console.log('Broadcasted tx');
      },
    });
  };

  return <button onClick={() => makeTransfer()}>Transfer</button>;
};
```

### Examples of interacting with contracts:

#### BNS Core

Generate a pre-order tx:

```ts
import { asciiToBytes, randomSalt, hashFqn } from '@bns-x/client';

const name = 'example';
const namespace = 'btc';
const price = 2000000n;

const salt = randomSalt();
const hashedFqn = hashFqn(name, namespace, salt);

const tx = contracts.bnsCore.namePreorder({
  hashedSaltedFqn: hashedFqn,
  stxToBurn: price,
});
```

Later, register the name:

```ts
const register = contracts.bnsCore.nameRegister({
  name: asciiToBytes(name),
  namespace: asciiToBytes(namespace),
  zonefileHash: new Uint8Array(),
  salt,
});
```

### Getting source code for a name wrapper contract

If you need to deploy a name wrapper contract, you can get the source code from `nameWrapperCode`.

```ts
const code = contracts.nameWrapperCode();
```

## Utility functions

This library exposes a few utility functions that come in handy when working with BNS.

### `asciiToBytes` and `bytesToAscii`

In BNS, all names are stored on-chain as ascii-converted bytes.

```ts
import { asciiToBytes, bytesToAscii } from '@bns-x/client';

// the human-readable version of the name:
const name = 'example';

// the name stored on chain
const nameBytes = asciiToBytes(name);

// convert from on-chain:
bytesToAscii(nameBytes) === name;
```

### `randomSalt`

When preordering a name on BNS, you need to create a random salt.

```ts
import { randomSalt } from '@bns-x/client';
const salt = randomSalt(); // Uint8Array
```

### `hashFqn`

When preordering a name, you need to create a "hashed salted fully qualified name". This helper function generates that for you.

```ts
import { asciiToBytes, randomSalt, hashFqn } from '@bns-x/client';

const name = 'example';
const namespace = 'btc';

const salt = randomSalt();
const hashedFqn = hashFqn(name, namespace, salt);
```

### `parseFqn`

If you have a string, you can parse it into individual parts:

```ts
import { parseFqn } from '@bns-x/client';
const name = parseFqn('example.btc');
name.name; // 'example'
name.namespace; // 'btc'
name.subdomain; // undefined

parseFqn('sub.example.btc');
// { name: 'example', namespace: 'btc', subdomain: 'sub' }
```
