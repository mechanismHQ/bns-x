# `@bns-x/client`

A library for interacting with BNS through contracts and an HTTP API.

<!-- TOC -->

- [@bns-x/client](#bns-xclient)
  - [Interacting with the BNS API](#interacting-with-the-bns-api)
    - [Create the API client](#create-the-api-client)
    - [Get the "display name" for an address](#get-the-display-name-for-an-address)
    - [Get details about a name](#get-details-about-a-name)
  - [Interacting with BNSx and BNS contracts](#interacting-with-bnsx-and-bns-contracts)
    - [The BnsxContractsClient](#the-bnsxcontractsclient)
    - [Interacting with specific contracts](#interacting-with-specific-contracts)
    - [Usage with Clarigen](#usage-with-clarigen)

<!-- /TOC -->

## Interacting with the BNS API

The default base URL for all API queries is `https://api.bns.xyz`.

### Create the API client

```ts
import { BnsxApiClient } from '@bns-x/client';

const bns = new BnsxApiClient();

// optionall, set base URL:
// new BnsxApiClient('http://example.com');
```

### Get the "display name" for an address

The logic for returning a user's "display name" is:

1. If the user owns any BNSx names, return that name
2. If the user owns a BNS name, return that name
3. If the user has a subdomain, return that

```ts
const name = await bns.getDisplayName();
```

### Get details about a name

```ts
const details = await bns.getNameDetails('example', 'btc');

// also can use a helper for a full name:
// await bns.getNameDetailsFromFqn('example.btc')
```

If the name doesn't exist, the function returns `null`.

Returns:

- `address`: the owner of this name
- `expire_block`: the block height this name expires at
- `zonefile`: zonefile for the name
- `isBnsx`: a boolean indicating whether the name has upgraded to BNSx

If the owner of the name has [inscribed their zonefile](https://bns.xyz), it also returns:

- `inscriptionId`: the ID of the inscription containing the zonefile
- `inscription`: object containing:
  - `blockHeight`: Bitcoin block height where the name was inscribed
  - `timestamp`: timestamp of the inscription's creation date
  - `txid`: Bitcoin txid where the inscription was created
  - `sat`: the "Sat" holding the inscription

If the name has been upgraded to BNSx, this response also includes:

- `id`: the NFT ID (integer)
- `legacy`: information about the status of the "legacy" name
  - `owner`: the wrapper contract holding this name

## Interacting with BNSx and BNS contracts

This package includes [clarigen](https://clarigen.dev) generated types and functions for interacting with BNS contracts.

### The `BnsxContractsClient`

Create a new client by specifying the network you're using. It can be one of `mainnet`, `testnet`, or `devnet`. This is used to automatically set the correct contract identifier for your network.

```ts
import { BnsxContractsClient } from '@bns-x/client';
// defaults to "mainnet"
export const contracts = new BnsxContractsClient();

// new BnsxContractsClient('testnet');
```

### Interacting with specific contracts

The contracts client includes getters for various BNSx and BNS contracts:

- `registry`: the main name registry contract for BNSx
- `queryHelper`: a contract that exposes various query-related helpers
- `legacyBns`: the BNS 1.0 contract
- `upgrader`: the contract responsible for upgrading wrapped names to BNSx

### Usage with Clarigen

Refer to the [clarigen](https://clarigen.dev) docs for more information - but here are a few quick examples.

In each example, `contracts` refers to an instance of the `BnsxContractsClient`.

**Generate a `ClarigenClient`**

```ts
import { ClarigenClient } from '@clarigen/web';
// Uses micro-stacks for network information
import { microStacksClient } from './micro-stacks';

export const clarigen = new Clarigen(microStacksClient);
```

**Call read-only functions**

```ts
const primaryName = await clarigen.ro(contracts.registry.getPrimaryName(address));

// `roOk` is a helper to automatically expect and scope to a function's `ok` type
const price = await clarigen.roOk(contracts.legacyBns.getNamePrice(nameBuff, namespaceBuff));
```
