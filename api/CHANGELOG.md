# @bns-x/api-types

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
