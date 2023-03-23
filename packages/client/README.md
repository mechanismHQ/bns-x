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
    - [Transfer a BNSx name](#transfer-a-bnsx-name)
    - [Unwrap a BNSx name](#unwrap-a-bnsx-name)
  - [Getting source code for a name wrapper contract](#getting-source-code-for-a-name-wrapper-contract)
- [Zonefiles](#zonefiles)
  - [Getting a BTC address](#getting-a-btc-address)
  - [Get an arbitrary TXT record](#get-an-arbitrary-txt-record)
- [Utility functions](#utility-functions)
  - [asciiToBytes and bytesToAscii](#asciitobytes-and-bytestoascii)
  - [randomSalt](#randomsalt)
  - [hashFqn](#hashfqn)
  - [parseFqn](#parsefqn)
  - [doesNamespaceExpire](#doesnamespaceexpire)
- [Punycode](#punycode)
  - [toUnicode](#tounicode)
  - [toPunycode](#topunycode)
  - [Zero-width-join characters and modifiers](#zero-width-join-characters-and-modifiers)

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
const address = 'SP123...';
const name = await bns.getDisplayName(address);
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
- `wrapper`: the wrapper contract that owns this name

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

// For other networks:
// new BnsContractsClient('testnet', 'https://stacks-node-api.testnet.stacks.co');
```

### Interacting with specific contracts

The contracts client includes getters for various BNSx and BNS contracts:

- `registry`: the main name registry contract for BNSx
- `queryHelper`: a contract that exposes various query-related helpers
- `bnsCore`: the BNS Core contract
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

#### Transfer a BNSx name

```ts
contracts.registry.transfer({
  id: 1,
  sender: 'SP123..',
  recipient: 'SP123..',
});
```

#### Unwrap a BNSx name

Because each wrapper contract is at a different address, the client exposes a helper function for creating a "wrapper instance" at a specific address.

```ts
const contractId = 'SP123...xyz.name-wrapper-200';
const wrapperContract = contracts.nameWrapper(contractId);

// now can interact with its functions
// wrapperContract.unwrap(...)
```

This example uses both the API and contracts client.

```ts
const nameDetails = await bnsApi.getNameDetailsFromFqn('example.btc');

if (!nameDetails.isBnsx) throw new Error('Cant unwrap name');

const { wrapper } = nameDetails;

const wrapperContract = contracts.nameWrapper(wrapper);

// you can specify a different recipient for the unwrapped name.
// If not specified, it defaults to the owner of the BNSx name.

wrapperContract.unwrap(); // sends BNS name to current BNSx owner

// send to different address:
wrapperContract.unwrap({
  recipient: 'SP123...asdf',
});
```

### Getting source code for a name wrapper contract

If you need to deploy a name wrapper contract, you can get the source code from `nameWrapperCode`.

```ts
const code = contracts.nameWrapperCode();
```

## Zonefiles

This library exposes a few functions to make it easier to get records from a name's zonefile.

The `ZoneFile` class can be constructed with a zonefile (`string`) and can be used to easily get information from the zonefile.

### Getting a BTC address

```ts
import { ZoneFile, BnsApiClient } from '@bns-x/client';

const client = new BnsApiClient();

// Returns `string | null`;
export async function getBtcAddress(name: string) {
  const nameDetails = await client.getNameDetailsFromFqn(name);
  if (nameDetails === null) {
    // name not found
    return null;
  }
  const zonefile = new ZoneFile(nameDetails.zonefile);

  // Returns `null` if `_btc._addr` not found in zonefile
  return zonefile.btcAddr;
}
```

### Get an arbitrary TXT record

If you want to get the TXT record for any specific key, you can use `getTxtRecord`.

```ts
const zonefile = new ZoneFile(nameDetails.zonefile);
const txtValue = zonefile.getTxtRecord('_eth._addr'); // returns `string | null`
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

### `doesNamespaceExpire`

Helper function to expose namespaces that do not expire.

**Note**: This is a hard-coded list. If new namespaces are registered, they are not automatically added to this list.

If you want to fetch on-chain data, use `BnsContractsClient#fetchNamespaceExpiration`.

Also exposed is `NO_EXPIRATION_NAMESPACES`, which is a set of strings.

```ts
import { doesNamespaceExpire, NO_EXPIRATION_NAMESPACES } from '@bns-x/client';

doesNamespaceExpire('stx'); // returns false
NO_EXPIRATION_NAMESPACE.has('stx'); // returns true
```

## Punycode

This package includes a few punycode-related functions and utilities.

Under the hood, the [`@adraffy/punycode`](https://github.com/adraffy/punycode.js) library is used.

### `toUnicode`

Converts a punycode string to unicode.

```ts
import { toUnicode } from '@bns-x/client';

toUnicode('xn--1ug66vku9r8p9h.btc'); // returns '🧔‍♂️.btc'
```

### `toPunycode`

Convert a unicode string to punycode.

```ts
import { toPunycode } from '@bns-x/client';

toPunycode('🧔‍♂️.btc'); // returns 'xn--1ug66vku9r8p9h.btc'
```

### Zero-width-join characters and modifiers

In Emoji, there are various "zero-width" or invisible characters that are part of a valid "emoji sequence". However, some users add _invalid_ ZWJ characters to a name in order to try and trick other users into thinking that a name just a single emoji.

This library exposes some functions for determining whether a string contains extra invalid ZWJ characters. It will _not_ flag valid ZWJ sequence emojis.

```ts
import { hasInvalidExtraZwj } from '@bns-x/client';

const badString = '🧜🏻‍'; // {1F9DC}{1F3FB}{200D} - extra `200D` at end

hasInvalidExtraZwj(badString); // true

const goodString = '🧔‍♂️'; // {1F9D4}{200D}{2642}{FE0F}

hasInvalidExtraZwj(goodString); // false, even though there are ZWJ characters
```
