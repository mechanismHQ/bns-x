# name-wrapper

[`name-wrapper.clar`](../contracts/name-wrapper.clar)

**Public functions:**

- [`unwrap`](#unwrap)
- [`name-update`](#name-update)

**Read-only functions:**

- [`get-own-name`](#get-own-name)
- [`get-name-info`](#get-name-info)
- [`get-owner`](#get-owner)

**Private functions:**

## Functions

### unwrap

[View in file](../contracts/name-wrapper.clar#L6)

`(define-public (unwrap ((recipient (optional principal))) (response (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal)) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (unwrap (recipient (optional principal)))
  (let
    (
      (props (try! (get-name-info)))
      (new-owner (default-to tx-sender recipient))
      (owner (get owner props))
    )
    (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
    (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry burn (get id props)))
    (unwrap! (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace props) (get name props) new-owner none)) ERR_NAME_TRANSFER)
    (ok props)
  )
)
```

</details>

**Parameters:**

| Name      | Type                 | Description |
| --------- | -------------------- | ----------- |
| recipient | (optional principal) |             |

### get-own-name

[View in file](../contracts/name-wrapper.clar#L20)

`(define-read-only (get-own-name () (response (tuple (name (buff 48)) (namespace (buff 20))) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-own-name)
  (ok (unwrap! (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal (as-contract tx-sender)) ERR_NO_NAME))
)
```

</details>

### get-name-info

[View in file](../contracts/name-wrapper.clar#L24)

`(define-read-only (get-name-info () (response (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal)) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-info)
  (let
    (
      (name (try! (get-own-name)))
      (props (unwrap! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry get-name-properties name) ERR_NOT_WRAPPED))
    )
    (ok props)
  )
)
```

</details>

### get-owner

[View in file](../contracts/name-wrapper.clar#L34)

`(define-read-only (get-owner () (response principal uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-owner)
  (ok (get owner (try! (get-name-info))))
)
```

</details>

### name-update

[View in file](../contracts/name-wrapper.clar#L38)

`(define-public (name-update ((zonefile-hash (buff 20))) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (name-update (zonefile-hash (buff 20)))
  (let
    (
      (props (try! (get-name-info)))
    )
    (asserts! (is-eq tx-sender (get owner props)) ERR_UNAUTHORIZED)
    (match (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-update (get namespace props) (get name props) zonefile-hash))
      r (ok true)
      e (err (to-uint e))
    )
  )
)
```

</details>

**Parameters:**

| Name          | Type      | Description |
| ------------- | --------- | ----------- |
| zonefile-hash | (buff 20) |             |
