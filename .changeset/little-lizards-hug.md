---
'web': patch
---

Various state within the Dots app now uses a more performant API call. Additionally, TRPC is used in place of OpenAPI calls, so that batching can be utilized better

Performance optimizations have also been made to the "accounts" page to render more quickly and reduce unnecessary refetches of data.
