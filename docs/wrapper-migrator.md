# wrapper-migrator

[`wrapper-migrator.clar`](../contracts/wrapper-migrator.clar)

The wrapper migrator contract provides a way for users to upgrade a BNS legacy
name to BNSx.

The high-level flow for using this migrator is:

- Deploy a wrapper contract (see [`.name-wrapper`](`./name-wrapper.md`))
- Verify the wrapper contract
- Finalize the migration

Because Stacks contracts don't have a way to verify the source code of another
contract, each wrapper contract must be verified by requesting a signature
off-chain. This prevents malicious users from deploying "fact" wrapper contracts
without the same guarantees.

For more detail on how each wrapper is verified, see
[`verify-wrapper`](#verify-wrapper)

Authorization for valid wrapper verifiers is only allowed through extensions
with the "mig-signer" role. By default, the contract deployer is a valid signer.

During migration, the legacy name is transferred to the wrapper contract. Then,
this contract interfaces with the [`.name-registry`](`./core/name-registry.md`)
contract to mint a new BNSx name.

**Public functions:**

- [`is-dao-or-extension`](#is-dao-or-extension)
- [`set-signers`](#set-signers)
- [`migrate`](#migrate)

**Read-only functions:**

- [`verify-wrapper`](#verify-wrapper)
- [`debug-signature`](#debug-signature)
- [`recover-pubkey-hash`](#recover-pubkey-hash)
- [`is-valid-signer`](#is-valid-signer)
- [`hash-principal`](#hash-principal)
- [`construct`](#construct)
- [`get-legacy-name`](#get-legacy-name)
- [`get-wrapper-name`](#get-wrapper-name)
- [`get-name-wrapper`](#get-name-wrapper)

**Private functions:**

- [`set-signers-iter`](#set-signers-iter)
- [`resolve-and-transfer`](#resolve-and-transfer)

**Maps**

- [`migrator-signers-map`](#migrator-signers-map)
- [`name-wrapper-map`](#name-wrapper-map)
- [`wrapper-name-map`](#wrapper-name-map)

**Variables**

- [`wrapped-id-var`](#wrapped-id-var)
- [`wrapper-deployer`](#wrapper-deployer)

**Constants**

- [`ROLE`](#ROLE)
- [`ERR_NO_NAME`](#ERR_NO_NAME)
- [`ERR_UNAUTHORIZED`](#ERR_UNAUTHORIZED)
- [`ERR_RECOVER`](#ERR_RECOVER)
- [`ERR_INVALID_CONTRACT_NAME`](#ERR_INVALID_CONTRACT_NAME)
- [`ERR_NAME_TRANSFER`](#ERR_NAME_TRANSFER)
- [`ERR_WRAPPER_USED`](#ERR_WRAPPER_USED)
- [`network-addr-version`](#network-addr-version)

## Functions

### is-dao-or-extension

[View in file](../contracts/wrapper-migrator.clar#L51)

`(define-public (is-dao-or-extension () (response bool uint))`

Authorization check - only extensions with the role "mig-signer" can add/remove
wrapper verifiers.

<details>
  <summary>Source code:</summary>

```clarity
(define-public (is-dao-or-extension)
  ;; (ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao has-role-or-extension contract-caller ROLE)) ERR_UNAUTHORIZED))
  (ok (asserts! (contract-call? .executor-dao has-role-or-extension contract-caller ROLE) ERR_UNAUTHORIZED))
)
```

</details>

### set-signers-iter

[View in file](../contracts/wrapper-migrator.clar#L57)

`(define-private (set-signers-iter ((item (tuple (enabled bool) (signer principal)))) (buff 20))`

#[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-private (set-signers-iter (item { signer: principal, enabled: bool }))
  (let
    (
      (pubkey (get hash-bytes (unwrap-panic (principal-destruct? (get signer item)))))
    )
    (print pubkey)
    (map-set migrator-signers-map pubkey (get enabled item))
    pubkey
  )
)
```

</details>

**Parameters:**

| Name | Type                                      | Description |
| ---- | ----------------------------------------- | ----------- |
| item | (tuple (enabled bool) (signer principal)) |             |

### set-signers

[View in file](../contracts/wrapper-migrator.clar#L72)

`(define-public (set-signers ((signers (list 50 (tuple (enabled bool) (signer principal))))) (response (list 50 (buff 20)) uint))`

Set valid wrapper verifiers

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-signers (signers (list 50 { signer: principal, enabled: bool })))
  (begin
    (try! (is-dao-or-extension))
    (ok (map set-signers-iter signers))
  )
)
```

</details>

**Parameters:**

| Name    | Type                                                | Description                                                                                                             |
| ------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| signers | (list 50 (tuple (enabled bool) (signer principal))) | a list of { signer: principal, enabled: bool } tuples. Existing verifiers can be removed by setting `enabled` to false. |

### migrate

[View in file](../contracts/wrapper-migrator.clar#L93)

`(define-public (migrate ((wrapper principal) (signature (buff 65)) (recipient principal)) (response (tuple (id uint) (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

Upgrade a name to BNSx

This function has three main steps:

- Verify the wrapper ([`verify-wrapper`](#verify-wrapper))
- Transfer the BNS legacy name to the wrapper
  ([`resolve-and-transfer`](#resolve-and-transfer))
- Register the name in the BNSx name registry
  ([`.name-registry#register`](`./core/name-registry#register.md`))

  <details>
  <summary>Source code:</summary>

```clarity
(define-public (migrate (wrapper principal) (signature (buff 65)) (recipient principal))
  (let
    (
      ;; #[filter(wrapper)]
      (wrapper-ok (try! (verify-wrapper wrapper signature)))
      (properties (try! (resolve-and-transfer wrapper)))
      (name (get name properties))
      (namespace (get namespace properties))
      (id (try! (contract-call? .name-registry register
        {
          name: name,
          namespace: namespace,
        }
        recipient
      )))
      (meta (merge { id: id } properties))
    )
    (print {
      topic: "migrate",
      wrapper: wrapper,
      id: id,
    })
    (asserts! (map-insert name-wrapper-map id wrapper) ERR_WRAPPER_USED)
    (asserts! (map-insert wrapper-name-map wrapper id) ERR_WRAPPER_USED)

    (ok meta)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description                                                                                  |
| --------- | --------- | -------------------------------------------------------------------------------------------- |
| wrapper   | principal | the principal of the wrapper contract that will be used                                      |
| signature | (buff 65) | a signature attesting to the validity of the wrapper contract                                |
| recipient | principal | a principal that will receive the BNSx name. Useful for consolidating names into one wallet. |

### verify-wrapper

[View in file](../contracts/wrapper-migrator.clar#L138)

`(define-read-only (verify-wrapper ((wrapper principal) (signature (buff 65))) (response bool uint))`

Verify a wrapper principal.

The message being signed is the Clarity-serialized representation of the
`wrapper` principal.

The pubkey is recovered from the signature. The `hash160` of this pubkey is then
checked to ensure that pubkey hash is stored as a valid signer.

@throws if the signature is invalid (cannot be recovered)

@throws if the pubkey is not a valid verifier

#[filter(wrapper)]

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (verify-wrapper (wrapper principal) (signature (buff 65)))
  (let
    (
      (msg (sha256 (unwrap-panic (to-consensus-buff? wrapper))))
      (pubkey (unwrap! (secp256k1-recover? msg signature) ERR_RECOVER))
      ;; (addr (unwrap-panic (principal-of? pubkey)))
      ;; (pubkey-hash (get hash-bytes (unwrap-panic (principal-destruct? addr))))
      (pubkey-hash (hash160 pubkey))
    )
    ;; (ok pubkey-hash)
    (asserts! (default-to false (map-get? migrator-signers-map pubkey-hash)) ERR_UNAUTHORIZED)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| wrapper   | principal |             |
| signature | (buff 65) |             |

### debug-signature

[View in file](../contracts/wrapper-migrator.clar#L153)

`(define-read-only (debug-signature ((wrapper principal) (signature (buff 65))) (response (tuple (pubkey-hash (buff 20)) (signer principal) (valid-signer bool)) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (debug-signature (wrapper principal) (signature (buff 65)))
  (let
    (
      (pubkey-hash (try! (recover-pubkey-hash wrapper signature)))
    )
    (ok {
      pubkey-hash: pubkey-hash,
      valid-signer: (default-to false (map-get? migrator-signers-map pubkey-hash)),
      signer: (unwrap-panic (principal-construct? network-addr-version pubkey-hash))
    })
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| wrapper   | principal |             |
| signature | (buff 65) |             |

### recover-pubkey-hash

[View in file](../contracts/wrapper-migrator.clar#L166)

`(define-read-only (recover-pubkey-hash ((wrapper principal) (signature (buff 65))) (response (buff 20) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (recover-pubkey-hash (wrapper principal) (signature (buff 65)))
  (let
    (
      (msg (sha256 (unwrap-panic (to-consensus-buff? wrapper))))
      (pubkey (unwrap! (secp256k1-recover? msg signature) ERR_RECOVER))
    )
    (ok (hash160 pubkey))
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| wrapper   | principal |             |
| signature | (buff 65) |             |

### is-valid-signer

[View in file](../contracts/wrapper-migrator.clar#L177)

`(define-read-only (is-valid-signer ((signer principal)) bool)`

Helper method to check if a given principal is a valid verifier

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-valid-signer (signer principal))
  (let
    (
      (pubkey (get hash-bytes (unwrap-panic (principal-destruct? signer))))
    )
    (default-to false (map-get? migrator-signers-map pubkey))
  )
)
```

</details>

**Parameters:**

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| signer | principal |             |

### hash-principal

[View in file](../contracts/wrapper-migrator.clar#L186)

`(define-read-only (hash-principal ((wrapper principal)) (buff 32))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (hash-principal (wrapper principal))
  (sha256 (unwrap-panic (to-consensus-buff? wrapper)))
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| wrapper | principal |             |

### construct

[View in file](../contracts/wrapper-migrator.clar#L190)

`(define-read-only (construct ((hash-bytes (buff 20))) (response principal (tuple (error_code uint) (value (optional principal)))))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (construct (hash-bytes (buff 20)))
  (principal-construct? network-addr-version hash-bytes)
)
```

</details>

**Parameters:**

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| hash-bytes | (buff 20) |             |

### get-legacy-name

[View in file](../contracts/wrapper-migrator.clar#L201)

`(define-read-only (get-legacy-name ((account principal)) (response (tuple (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

Fetch the BNS legacy name and name properties owned by a given account.

@throws if the account does not own a valid name

@throws if the name owned by the account is expired

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-legacy-name (account principal))
  (match (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal account)
    name (let
      (
        (properties (unwrap-panic (contract-call? 'SP000000000000000000002Q6VF78.bns name-resolve (get namespace name) (get name name))))
      )
      (ok (merge name properties))
    )
    e ERR_NO_NAME
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |

### resolve-and-transfer

[View in file](../contracts/wrapper-migrator.clar#L215)

`(define-private (resolve-and-transfer ((wrapper principal)) (response (tuple (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

Transfer an account's BNS legacy name to a wrapper contract. #[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-private (resolve-and-transfer (wrapper principal))
  (let
    (
      (name (try! (get-legacy-name tx-sender)))
    )
    (match (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace name) (get name name) wrapper (some (get zonefile-hash name)))
      success (begin
        (print (merge name {
          topic: "v1-name-transfer",
          wrapper: wrapper,
        }))
        (ok name)
      )
      err-code (begin
        (print {
          topic: "name-transfer-error",
          bns-error: err-code,
          sender: tx-sender,
          name: name,
        })
        ERR_NAME_TRANSFER
      )
    )
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| wrapper | principal |             |

### get-wrapper-name

[View in file](../contracts/wrapper-migrator.clar#L245)

`(define-read-only (get-wrapper-name ((wrapper principal)) (optional uint))`

Helper method to fetch the BNS legacy name that was previously transferred to a
given wrapper contract.

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-wrapper-name (wrapper principal)) (map-get? wrapper-name-map wrapper))
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| wrapper | principal |             |

### get-name-wrapper

[View in file](../contracts/wrapper-migrator.clar#L251)

`(define-read-only (get-name-wrapper ((name uint)) (optional principal))`

Helper method to fetch the wrapper contract that was used during migration of a
given name

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-wrapper (name uint)) (map-get? name-wrapper-map name))
```

</details>

**Parameters:**

| Name | Type | Description                |
| ---- | ---- | -------------------------- |
| name | uint | the name ID of a BNSx name |

## Maps

### migrator-signers-map

[View in file](../contracts/wrapper-migrator.clar#L33)

`(define-map migrator-signers-map (buff 20) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-map migrator-signers-map (buff 20) bool)
```

</details>

### name-wrapper-map

[View in file](../contracts/wrapper-migrator.clar#L35)

`(define-map name-wrapper-map uint principal)`

<details>
  <summary>Source code:</summary>

```clarity
(define-map name-wrapper-map uint principal)
```

</details>

### wrapper-name-map

[View in file](../contracts/wrapper-migrator.clar#L36)

`(define-map wrapper-name-map principal uint)`

<details>
  <summary>Source code:</summary>

```clarity
(define-map wrapper-name-map principal uint)
```

</details>

## Variables

### ROLE

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L24)

`(define-constant ROLE (string-ascii 10))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ROLE "mig-signer")
```

</details>

### ERR_NO_NAME

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L26)

`(define-constant ERR_NO_NAME (response none uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ERR_NO_NAME (err u6000))
```

</details>

### ERR_UNAUTHORIZED

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L27)

`(define-constant ERR_UNAUTHORIZED (response none uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ERR_UNAUTHORIZED (err u6001))
```

</details>

### ERR_RECOVER

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L28)

`(define-constant ERR_RECOVER (response none uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ERR_RECOVER (err u6002))
```

</details>

### ERR_INVALID_CONTRACT_NAME

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L29)

`(define-constant ERR_INVALID_CONTRACT_NAME (response none uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ERR_INVALID_CONTRACT_NAME (err u6003))
```

</details>

### ERR_NAME_TRANSFER

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L30)

`(define-constant ERR_NAME_TRANSFER (response none uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ERR_NAME_TRANSFER (err u6004))
```

</details>

### ERR_WRAPPER_USED

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L31)

`(define-constant ERR_WRAPPER_USED (response none uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant ERR_WRAPPER_USED (err u6005))
```

</details>

### wrapped-id-var

Type: `variable`

[View in file](../contracts/wrapper-migrator.clar#L38)

`(define-data-var wrapped-id-var uint)`

<details>
  <summary>Source code:</summary>

```clarity
(define-data-var wrapped-id-var uint u0)
```

</details>

### wrapper-deployer

Type: `variable`

[View in file](../contracts/wrapper-migrator.clar#L39)

`(define-data-var wrapper-deployer (buff 20))`

<details>
  <summary>Source code:</summary>

```clarity
(define-data-var wrapper-deployer (buff 20) (get hash-bytes (unwrap-panic (principal-destruct? tx-sender))))
```

</details>

### network-addr-version

Type: `constant`

[View in file](../contracts/wrapper-migrator.clar#L41)

`(define-constant network-addr-version (buff 1))`

<details>
  <summary>Source code:</summary>

```clarity
(define-constant network-addr-version (if is-in-mainnet 0x16 0x1a))
```

</details>
