# wrapper-migrator

[`wrapper-migrator.clar`](../contracts/wrapper-migrator.clar)

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

## Functions

### is-dao-or-extension

[View in file](../contracts/wrapper-migrator.clar#L26)

`(define-public (is-dao-or-extension () (response bool uint))`

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

[View in file](../contracts/wrapper-migrator.clar#L32)

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

[View in file](../contracts/wrapper-migrator.clar#L43)

`(define-public (set-signers ((signers (list 50 (tuple (enabled bool) (signer principal))))) (response (list 50 (buff 20)) uint))`

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

| Name    | Type                                                | Description |
| ------- | --------------------------------------------------- | ----------- |
| signers | (list 50 (tuple (enabled bool) (signer principal))) |             |

### migrate

[View in file](../contracts/wrapper-migrator.clar#L52)

`(define-public (migrate ((wrapper principal) (signature (buff 65)) (recipient principal)) (response (tuple (id uint) (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

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

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| wrapper   | principal |             |
| signature | (buff 65) |             |
| recipient | principal |             |

### verify-wrapper

[View in file](../contracts/wrapper-migrator.clar#L85)

`(define-read-only (verify-wrapper ((wrapper principal) (signature (buff 65))) (response bool uint))`

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

[View in file](../contracts/wrapper-migrator.clar#L100)

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

[View in file](../contracts/wrapper-migrator.clar#L113)

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

[View in file](../contracts/wrapper-migrator.clar#L123)

`(define-read-only (is-valid-signer ((signer principal)) bool)`

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

[View in file](../contracts/wrapper-migrator.clar#L132)

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

[View in file](../contracts/wrapper-migrator.clar#L136)

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

[View in file](../contracts/wrapper-migrator.clar#L142)

`(define-read-only (get-legacy-name ((account principal)) (response (tuple (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

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

[View in file](../contracts/wrapper-migrator.clar#L155)

`(define-private (resolve-and-transfer ((wrapper principal)) (response (tuple (lease-ending-at (optional uint)) (lease-started-at uint) (name (buff 48)) (namespace (buff 20)) (owner principal) (zonefile-hash (buff 20))) uint))`

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

### get-wrapper-name

[View in file](../contracts/wrapper-migrator.clar#L183)

`(define-read-only (get-wrapper-name ((wrapper principal)) (optional uint))`

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

[View in file](../contracts/wrapper-migrator.clar#L185)

`(define-read-only (get-name-wrapper ((name uint)) (optional principal))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-wrapper (name uint)) (map-get? name-wrapper-map name))
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | uint |             |
