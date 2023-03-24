# @bns-x/api-types

## 0.2.1

### Patch Changes

- Updated dependencies [6193fb6]
  - @bns-x/punycode@0.2.2
  - @bns-x/core@0.1.4

## 0.2.0

### Minor Changes

- 08c807a: Updates the NFT metadata route to use new punycode functionality. Also, the returned `name` of the NFT now includes both ascii and punycode versions of the name, along with a '🟥' if the name includes extra ZWJ modifiers.

### Patch Changes

- Updated dependencies [08c807a]
  - @bns-x/punycode@0.2.1
  - @bns-x/core@0.1.3

## 0.1.0

### Minor Changes

- 2798640: Fixes an issue with the `name_ownership` materialized view not basing state off of canonical events

### Patch Changes

- 69a8c03: Regenerates the `names` materialized view to properly handle burned and re-minted names
- 61ee366: New API endpoint to broadcast a transaction to multiple nodes. This can help ensure an attachment is propogated successfully.
- Updated dependencies [d050746]
  - @bns-x/core@0.1.2

## 0.0.5

### Patch Changes

- 9c00da3: Updates the logic for syncing BNSx events from a Stacks node to more consistently index events.
- 9c00da3: Updates the NFT metadata endpoint to return the unicode version of a name for punycode names.

## 0.0.4

### Patch Changes

- b1c63fc: Return unicode version for BNS core display names
- 88b937c: Expose simple endpoint to return recent BNSx names

## 0.0.3

### Patch Changes

- 5870578: Fixes an issue where burnt names were not indexed correctly in the "names" materialized view.

  Also adds "wrapper" property to the "name details" api for BNSx names.

## 0.0.2

### Patch Changes

- [`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28) Thanks [@hstove](https://github.com/hstove)! - Initial changelog setup

- Updated dependencies [[`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28)]:
  - @bns-x/core@0.1.1
