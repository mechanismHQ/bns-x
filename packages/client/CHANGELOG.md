# @bns-x/client

## 0.3.3

### Patch Changes

- Updated dependencies [5b519d1]
- Updated dependencies [293579a]
  - @bns-x/core@0.2.1

## 0.3.2

### Patch Changes

- 44cd014: Adds a new "get total names" endpoint to the API. This can be fetched at `/bns/total-names`.

## 0.3.1

### Patch Changes

- dc2fbf5: Allows setting the `_lnaddr_redirect` URI key when updating zonefile

## 0.3.0

### Minor Changes

- 22cc6ed: Created a new "name wrapper" contract that has functionality to support renewing a name and withdrawing assets that were accidentally sent to the name.

### Patch Changes

- Updated dependencies [22cc6ed]
  - @bns-x/core@0.2.0

## 0.2.4

### Patch Changes

- bc1ce22: Readme updates and improvements to `getNameDetails`

## 0.2.3

### Patch Changes

- Updated dependencies [c389100]
  - @bns-x/punycode@0.2.3
  - @bns-x/core@0.1.5

## 0.2.2

### Patch Changes

- Updated dependencies [6193fb6]
  - @bns-x/punycode@0.2.2
  - @bns-x/core@0.1.4

## 0.2.1

### Patch Changes

- 08c807a: Moves punycode related functionality into `@bns-x/punycode` package
- Updated dependencies [08c807a]
  - @bns-x/punycode@0.2.1
  - @bns-x/core@0.1.3

## 0.2.0

### Minor Changes

- f14a8fb: Adds punycode and ZWJ utilities to the package.

### Patch Changes

- d050746: - Exposes utility function `doesNamespaceExpire`, `NO_EXPIRATION_NAMESPACES`, and adds `fetchNamespaceProperties` to `BnsContractsClient`.
  - Updates Clarigen types
- 61ee366: New API endpoint to broadcast a transaction to multiple nodes. This can help ensure an attachment is propogated successfully.
- 4f2105a: Fixes types in the `ZoneFile` class for fetching records. Also add s helpers for getting URI records.
- Updated dependencies [d050746]
  - @bns-x/core@0.1.2

## 0.1.2

### Patch Changes

- 9c00da3: Includes a `ZoneFile` class exposed by the client package to easily interact with zonefiles.

## 0.1.1

### Patch Changes

- 267c15f: Updates documentation for interacting with contracts

## 0.1.0

### Minor Changes

- 5870578: Adds "wrapper" property to name details for BNSx names

## 0.0.2

### Patch Changes

- [`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28) Thanks [@hstove](https://github.com/hstove)! - Initial changelog setup

- Updated dependencies [[`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28)]:
  - @bns-x/core@0.1.1
