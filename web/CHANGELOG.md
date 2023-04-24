# web

## 0.2.2

### Patch Changes

- c383f32: Adds the ability to renew a name. Names that are wrapped in BNSx can also be renewed without needing to unwrap.

## 0.2.1

### Patch Changes

- e79d3e0: Various state within the Dots app now uses a more performant API call. Additionally, TRPC is used in place of OpenAPI calls, so that batching can be utilized better

  Performance optimizations have also been made to the "accounts" page to render more quickly and reduce unnecessary refetches of data.

- 8dae301: The accounts page now includes an "instant action" button next to accounts that are ready for the next transaction. This will open a transaction popup for the next step without having to change the page.

## 0.2.0

### Minor Changes

- 53fd5e7: Dots is now a multi-accounts app!

  With this update, you no longer need to log out and back in to use different accounts (addresses) with Dots. You can add and remove unlimited accounts.

  A new "accounts" page shows an overview of all of your connected accounts, along with the status of any migrations to BNSx for that account.

  You can complete multiple BNSx migrations simultaneously, with migration status reflected in real-time on the accounts page.

## 0.1.12

### Patch Changes

- 2f3fcc4: Prevent unwrap if the recipient already has a BNS name
- a5e84e6: Adds the ability to unwrap names
- Updated dependencies [22cc6ed]
  - @bns-x/client@0.3.0
  - @bns-x/core@0.2.0
  - @bns-x/api-types@0.2.3

## 0.1.11

### Patch Changes

- Updated dependencies [bc1ce22]
  - @bns-x/client@0.2.4

## 0.1.10

### Patch Changes

- Updated dependencies [c389100]
  - @bns-x/punycode@0.2.3
  - @bns-x/api-types@0.2.2
  - @bns-x/client@0.2.3
  - @bns-x/core@0.1.5

## 0.1.9

### Patch Changes

- 6193fb6: Adds `/punycode` page to debug punycode display
- Updated dependencies [6193fb6]
  - @bns-x/punycode@0.2.2
  - @bns-x/api-types@0.2.1
  - @bns-x/client@0.2.2
  - @bns-x/core@0.1.4

## 0.1.8

### Patch Changes

- Updated dependencies [08c807a]
- Updated dependencies [08c807a]
  - @bns-x/api-types@0.2.0
  - @bns-x/client@0.2.1
  - @bns-x/punycode@0.2.1
  - @bns-x/core@0.1.3

## 0.1.7

### Patch Changes

- deb5f48: When users click 'get started' on the homepage without a Stacks wallet, show the 'connect' screen
- bc07a70: Added a new "edit profile" page for BNS names, where you can update your zonefile.
- Updated dependencies [69a8c03]
- Updated dependencies [f14a8fb]
- Updated dependencies [d050746]
- Updated dependencies [61ee366]
- Updated dependencies [2798640]
- Updated dependencies [4f2105a]
  - @bns-x/api-types@0.1.0
  - @bns-x/client@0.2.0
  - @bns-x/core@0.1.2

## 0.1.6

### Patch Changes

- 9c00da3: Updates the menu and upgrade overview page to show the unicode version of names
- Updated dependencies [9c00da3]
- Updated dependencies [9c00da3]
- Updated dependencies [9c00da3]
  - @bns-x/client@0.1.2
  - @bns-x/api-types@0.0.5

## 0.1.5

### Patch Changes

- 84f04fb: Prevents transferrring to a contract address when upgrading

## 0.1.4

### Patch Changes

- a78746d: For mobile users, clicking the avatar will let you upgrade a name.

  Also, the dropdown menu has been shifted to the left, to prevent page layout changes when the menu is open.

## 0.1.3

### Patch Changes

- b0affde: Fixed an issue where the confirmation screen could show 'pending' after sending a BNSx name to a different recipient.
- 458b00d: When the user doesn't have a Stacks wallet installed, show the connect popup.
- Updated dependencies [b1c63fc]
- Updated dependencies [267c15f]
- Updated dependencies [88b937c]
  - @bns-x/api-types@0.0.4
  - @bns-x/client@0.1.1

## 0.1.2

### Patch Changes

- Updated dependencies [5870578]
- Updated dependencies [5870578]
  - @bns-x/client@0.1.0
  - @bns-x/api-types@0.0.3

## 0.1.1

### Patch Changes

- [`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28) Thanks [@hstove](https://github.com/hstove)! - Initial changelog setup

- Updated dependencies [[`ecafc25`](https://github.com/mechanismHQ/bns-x/commit/ecafc25afbbb1892a3ab6483e11dc4af13765e28)]:
  - @bns-x/client@0.0.2
  - @bns-x/core@0.1.1
  - @bns-x/api-types@0.0.2
