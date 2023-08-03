---
'@bns-x/core': minor
'contracts': minor
---

A new migrator contract, `wrapper-migrator-v2` has been added.

The key change for this contract is that it uses Clarity 2.0 functions. Specifically, the `to-consensus-buff?` method is used to hash a wrapper contract's identifier, which can be used to verify signatures.

Previously, the migrator relied on the wrapper contract "registering" itself, which would allow mapping a wrapper principal to an integer. Prior to Clarity 2, integers were one of the only data types that could be hashed.

The main benefit of this new contract is that it is less faulty to re-orgs when multiple wrapper contracts are deployed. Previously, in some cases, a re-org could cause a wrapper contracts "ID" to change, which would invalidate signatures. Additionally, migrations can now occur before wrapper contract deployments are confirmed.
