# wrapper-migrator

[`wrapper-migrator-v1.clar`](../contracts/wrapper-migrator-v1.clar)

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
this contract interfaces with the [`.bnsx-registry`](`./core/name-registry.md`)
contract to mint a new BNSx name.

**Public functions:**

- [`is-dao-or-extension`](#is-dao-or-extension)
- [`set-signers`](#set-signers)
- [`migrate`](#migrate)
- [`register-wrapper`](#register-wrapper)

**Read-only functions:**

- [`verify-wrapper`](#verify-wrapper)
- [`hash-id`](#hash-id)
- [`debug-signature`](#debug-signature)
- [`recover-pubkey-hash`](#recover-pubkey-hash)
- [`is-valid-signer`](#is-valid-signer)
- [`get-legacy-name`](#get-legacy-name)
- [`get-wrapper-name`](#get-wrapper-name)
- [`get-name-wrapper`](#get-name-wrapper)
- [`get-id-from-wrapper`](#get-id-from-wrapper)
- [`get-wrapper-from-id`](#get-wrapper-from-id)

**Private functions:**

- [`set-signers-iter`](#set-signers-iter)
- [`resolve-and-transfer`](#resolve-and-transfer)
- [`get-next-wrapper-id`](#get-next-wrapper-id)

**Maps**

- [`migrator-signers-map`](#migrator-signers-map)
- [`name-wrapper-map`](#name-wrapper-map)
- [`wrapper-name-map`](#wrapper-name-map)
- [`wrapper-id-map`](#wrapper-id-map)
- [`id-wrapper-map`](#id-wrapper-map)

**Variables**

- [`next-wrapper-id-var`](#next-wrapper-id-var)

**Constants**

- [`ROLE`](#ROLE)
- [`ERR_NO_NAME`](#ERR_NO_NAME)
- [`ERR_UNAUTHORIZED`](#ERR_UNAUTHORIZED)
- [`ERR_RECOVER`](#ERR_RECOVER)
- [`ERR_INVALID_CONTRACT_NAME`](#ERR_INVALID_CONTRACT_NAME)
- [`ERR_NAME_TRANSFER`](#ERR_NAME_TRANSFER)
- [`ERR_WRAPPER_USED`](#ERR_WRAPPER_USED)
- [`ERR_WRAPPER_NOT_REGISTERED`](#ERR_WRAPPER_NOT_REGISTERED)
- [`ERR_WRAPPER_ALREADY_REGISTERED`](#ERR_WRAPPER_ALREADY_REGISTERED)

## Functions

### is-dao-or-extension

[View in file](../contracts/wrapper-migrator-v1.clar#L49)

`(define-public (is-dao-or-extension () (response bool uint))`

Authorization check - only extensions with the role "mig-signer" can add/remove
wrapper verifiers.

<details>
  <summary>Source code:</summary>

```clarity
(define-public (is-dao-or-extension)
  (ok (asserts! (or (is-eq tx-sender .bnsx-extensions) (contract-call? .bnsx-extensions has-role-or-extension contract-caller ROLE)) ERR_UNAUTHORIZED))
)
```

</details>

### set-signers-iter

[View in file](../contracts/wrapper-migrator-v1.clar#L54)

`(define-private (set-signers-iter ((item (tuple (enabled bool) (signer (buff 20))))) (buff 20))`

#[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-private (set-signers-iter (item { signer: (buff 20), enabled: bool }))
  (let
    (
      (pubkey (get signer item))
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
| item | (tuple (enabled bool) (signer (buff 20))) |             |

### set-signers

[View in file](../contracts/wrapper-migrator-v1.clar#L69)

`(define-public (set-signers ((signers (list 50 (tuple (enabled bool) (signer (buff 20)))))) (response (list 50 (buff 20)) uint))`

Set valid wrapper verifiers

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-signers (signers (list 50 { signer: (buff 20), enabled: bool })))
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
| signers | (list 50 (tuple (enabled bool) (signer (buff 20)))) | a list of { signer: principal, enabled: bool } tuples. Existing verifiers can be removed by setting `enabled` to false. |

### migrate

[View in file](../contracts/wrapper-migrator-v1.clar#L90)

`(define-public (migrate ((wrapper principal) (signature (buff 65)) (recipient principal)) (response (tuple (id uint) (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

Upgrade a name to BNSx

This function has three main steps:

- Verify the wrapper ([`verify-wrapper`](#verify-wrapper))
- Transfer the BNS legacy name to the wrapper
  ([`resolve-and-transfer`](#resolve-and-transfer))
- Register the name in the BNSx name registry
  ([`.bnsx-registry#register`](`./core/name-registry#register.md`))

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
      (id (try! (contract-call? .bnsx-registry register
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

### register-wrapper

[View in file](../contracts/wrapper-migrator-v1.clar#L123)

`(define-public (register-wrapper ((wrapper principal)) (response uint uint))`

Register a wrapper contract

This is necessary to establish an integer ID for each wrapper principal. This ID
can then be used to validate signatures

<details>
  <summary>Source code:</summary>

```clarity
(define-public (register-wrapper (wrapper principal))
  (let
    (
      (id (get-next-wrapper-id))
    )
    (asserts! (map-insert wrapper-id-map wrapper id) ERR_WRAPPER_ALREADY_REGISTERED)
    (map-insert id-wrapper-map id wrapper)
    (ok id)
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| wrapper | principal |             |

### verify-wrapper

[View in file](../contracts/wrapper-migrator-v1.clar#L149)

`(define-read-only (verify-wrapper ((wrapper principal) (signature (buff 65))) (response bool uint))`

Verify a wrapper principal.

The message being signed is the Clarity-serialized representation of the
`wrapper` principal.

The pubkey is recovered from the signature. The `hash160` of this pubkey is then
checked to ensure that pubkey hash is stored as a valid signer.

@throws if the signature is invalid (cannot be recovered)

@throws if the pubkey is not a valid verifier

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (verify-wrapper (wrapper principal) (signature (buff 65)))
  (let
    (
      (id (unwrap! (map-get? wrapper-id-map wrapper) ERR_WRAPPER_NOT_REGISTERED))
      (msg (sha256 id))
      (pubkey (unwrap! (secp256k1-recover? msg signature) ERR_RECOVER))
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

### hash-id

[View in file](../contracts/wrapper-migrator-v1.clar#L163)

`(define-read-only (hash-id ((id uint)) (buff 32))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (hash-id (id uint))
  (sha256 id)
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### debug-signature

[View in file](../contracts/wrapper-migrator-v1.clar#L167)

`(define-read-only (debug-signature ((wrapper principal) (signature (buff 65))) (response (tuple (pubkey-hash (buff 20)) (valid-signer bool)) uint))`

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

[View in file](../contracts/wrapper-migrator-v1.clar#L179)

`(define-read-only (recover-pubkey-hash ((wrapper principal) (signature (buff 65))) (response (buff 20) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (recover-pubkey-hash (wrapper principal) (signature (buff 65)))
  (let
    (
      (id (unwrap! (map-get? wrapper-id-map wrapper) ERR_WRAPPER_NOT_REGISTERED))
      (msg (sha256 id))
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

[View in file](../contracts/wrapper-migrator-v1.clar#L191)

`(define-read-only (is-valid-signer ((pubkey (buff 20))) bool)`

Helper method to check if a given principal is a valid verifier

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-valid-signer (pubkey (buff 20)))
  (default-to false (map-get? migrator-signers-map pubkey))
)
```

</details>

**Parameters:**

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| pubkey | (buff 20) |             |

### get-legacy-name

[View in file](../contracts/wrapper-migrator-v1.clar#L200)

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

[View in file](../contracts/wrapper-migrator-v1.clar#L214)

`(define-private (resolve-and-transfer ((wrapper principal)) (response (tuple (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

Transfer an account's BNS legacy name to a wrapper contract.
#[allow(unchecked_data)]

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

### get-next-wrapper-id

[View in file](../contracts/wrapper-migrator-v1.clar#L240)

`(define-private (get-next-wrapper-id () uint)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (get-next-wrapper-id)
  (let
    (
      (id (var-get next-wrapper-id-var))
    )
    (var-set next-wrapper-id-var (+ id u1))
    id
  )
)
```

</details>

### get-wrapper-name

[View in file](../contracts/wrapper-migrator-v1.clar#L254)

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

[View in file](../contracts/wrapper-migrator-v1.clar#L260)

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

### get-id-from-wrapper

[View in file](../contracts/wrapper-migrator-v1.clar#L262)

`(define-read-only (get-id-from-wrapper ((wrapper principal)) (optional uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-id-from-wrapper (wrapper principal))
  (map-get? wrapper-id-map wrapper)
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| wrapper | principal |             |

### get-wrapper-from-id

[View in file](../contracts/wrapper-migrator-v1.clar#L266)

`(define-read-only (get-wrapper-from-id ((id uint)) (optional principal))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-wrapper-from-id (id uint))
  (map-get? id-wrapper-map id)
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

## Maps

### migrator-signers-map

```clarity
(define-map migrator-signers-map (buff 20) bool)
```

[View in file](../contracts/wrapper-migrator-v1.clar#L35)

### name-wrapper-map

```clarity
(define-map name-wrapper-map uint principal)
```

[View in file](../contracts/wrapper-migrator-v1.clar#L37)

### wrapper-name-map

```clarity
(define-map wrapper-name-map principal uint)
```

[View in file](../contracts/wrapper-migrator-v1.clar#L38)

### wrapper-id-map

```clarity
(define-map wrapper-id-map principal uint)
```

[View in file](../contracts/wrapper-migrator-v1.clar#L40)

### id-wrapper-map

```clarity
(define-map id-wrapper-map uint principal)
```

[View in file](../contracts/wrapper-migrator-v1.clar#L41)

## Variables

### next-wrapper-id-var

uint

```clarity
(define-data-var next-wrapper-id-var uint u0)
```

[View in file](../contracts/wrapper-migrator-v1.clar#L43)

## Constants

### ROLE

```clarity
(define-constant ROLE "mig-signer")
```

[View in file](../contracts/wrapper-migrator-v1.clar#L24)

### ERR_NO_NAME

```clarity
(define-constant ERR_NO_NAME (err u6000))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L26)

### ERR_UNAUTHORIZED

```clarity
(define-constant ERR_UNAUTHORIZED (err u6001))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L27)

### ERR_RECOVER

```clarity
(define-constant ERR_RECOVER (err u6002))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L28)

### ERR_INVALID_CONTRACT_NAME

```clarity
(define-constant ERR_INVALID_CONTRACT_NAME (err u6003))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L29)

### ERR_NAME_TRANSFER

```clarity
(define-constant ERR_NAME_TRANSFER (err u6004))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L30)

### ERR_WRAPPER_USED

```clarity
(define-constant ERR_WRAPPER_USED (err u6005))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L31)

### ERR_WRAPPER_NOT_REGISTERED

```clarity
(define-constant ERR_WRAPPER_NOT_REGISTERED (err u6006))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L32)

### ERR_WRAPPER_ALREADY_REGISTERED

```clarity
(define-constant ERR_WRAPPER_ALREADY_REGISTERED (err u6007))
```

[View in file](../contracts/wrapper-migrator-v1.clar#L33)
