# @bns-x/client

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
