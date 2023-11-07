# contracts

## 0.2.1

### Patch Changes

- Updated dependencies [e8a306d]
  - @bns-x/client@0.4.0

## 0.2.0

### Minor Changes

- b3d7adb: A new migrator contract, `wrapper-migrator-v2` has been added.

  The key change for this contract is that it uses Clarity 2.0 functions. Specifically, the `to-consensus-buff?` method is used to hash a wrapper contract's identifier, which can be used to verify signatures.

  Previously, the migrator relied on the wrapper contract "registering" itself, which would allow mapping a wrapper principal to an integer. Prior to Clarity 2, integers were one of the only data types that could be hashed.

  The main benefit of this new contract is that it is less faulty to re-orgs when multiple wrapper contracts are deployed. Previously, in some cases, a re-org could cause a wrapper contracts "ID" to change, which would invalidate signatures. Additionally, migrations can now occur before wrapper contract deployments are confirmed.

### Patch Changes

- Updated dependencies [b3d7adb]
- Updated dependencies [8c9135e]
  - @bns-x/core@0.3.0
  - @bns-x/client@0.3.4

## 0.1.3

### Patch Changes

- 293579a: Adds a contract for single-transaction name registrations
- Updated dependencies [5b519d1]
- Updated dependencies [293579a]
  - @bns-x/core@0.2.1
  - @bns-x/client@0.3.3

## 0.1.2

### Patch Changes

- Updated dependencies [44cd014]
  - @bns-x/client@0.3.2

## 0.1.1

### Patch Changes

- Updated dependencies [dc2fbf5]
  - @bns-x/client@0.3.1

## 0.1.0

### Minor Changes

- 22cc6ed: Created a new "name wrapper" contract that has functionality to support renewing a name and withdrawing assets that were accidentally sent to the name.

### Patch Changes

- Updated dependencies [22cc6ed]
  - @bns-x/client@0.3.0
  - @bns-x/core@0.2.0

## 0.0.6

### Patch Changes

- Updated dependencies [bc1ce22]
  - @bns-x/client@0.2.4

## 0.0.5

### Patch Changes

- @bns-x/client@0.2.3
- @bns-x/core@0.1.5

## 0.0.4

### Patch Changes

- @bns-x/client@0.2.2
- @bns-x/core@0.1.4

## 0.0.3

### Patch Changes

- Updated dependencies [08c807a]
  - @bns-x/client@0.2.1
  - @bns-x/core@0.1.3

## 0.0.2

### Patch Changes

- Updated dependencies [f14a8fb]
- Updated dependencies [d050746]
- Updated dependencies [61ee366]
- Updated dependencies [4f2105a]
  - @bns-x/client@0.2.0
  - @bns-x/core@0.1.2

## null

### Patch Changes

- Updated dependencies [[`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28)]:
  - @bns-x/core@0.1.1
