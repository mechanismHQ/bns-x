---
'@bns-x/api-types': minor
---

Updates the NFT metadata route to use new punycode functionality. Also, the returned `name` of the NFT now includes both ascii and punycode versions of the name, along with a '🟥' if the name includes extra ZWJ modifiers.
