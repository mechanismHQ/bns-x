# @bns-x/core

## 0.3.0

### Minor Changes

- b3d7adb: A new migrator contract, `wrapper-migrator-v2` has been added.

  The key change for this contract is that it uses Clarity 2.0 functions. Specifically, the `to-consensus-buff?` method is used to hash a wrapper contract's identifier, which can be used to verify signatures.

  Previously, the migrator relied on the wrapper contract "registering" itself, which would allow mapping a wrapper principal to an integer. Prior to Clarity 2, integers were one of the only data types that could be hashed.

  The main benefit of this new contract is that it is less faulty to re-orgs when multiple wrapper contracts are deployed. Previously, in some cases, a re-org could cause a wrapper contracts "ID" to change, which would invalidate signatures. Additionally, migrations can now occur before wrapper contract deployments are confirmed.

### Patch Changes

- 8c9135e: Adds client-side namespace properties, which are pulled from on-chain data.

## 0.2.1

### Patch Changes

- 5b519d1: Adds client-side namespace properties, which are pulled from on-chain data.
- 293579a: Adds a contract for single-transaction name registrations

## 0.2.0

### Minor Changes

- 22cc6ed: Created a new "name wrapper" contract that has functionality to support renewing a name and withdrawing assets that were accidentally sent to the name.

## 0.1.5

### Patch Changes

- Updated dependencies [c389100]
  - @bns-x/punycode@0.2.3

## 0.1.4

### Patch Changes

- Updated dependencies [6193fb6]
  - @bns-x/punycode@0.2.2

## 0.1.3

### Patch Changes

- Updated dependencies [08c807a]
  - @bns-x/punycode@0.2.1

## 0.1.2

### Patch Changes

- d050746: - Exposes utility function `doesNamespaceExpire`, `NO_EXPIRATION_NAMESPACES`, and adds `fetchNamespaceProperties` to `BnsContractsClient`.
  - Updates Clarigen types

## 0.1.1

### Patch Changes

- [`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28) Thanks [@hstove](https://github.com/hstove)! - Initial changelog setup
