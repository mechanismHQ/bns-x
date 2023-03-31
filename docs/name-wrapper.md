# name-wrapper

[`name-wrapper.clar`](../contracts/contracts/name-wrapper.clar)

Source code for the name wrapper contract.

This contract is not meant to be deployed as a standalone contract in the BNSx
protocol. Instead, it is deployed for each individual name that is upgraded to
BNSx.

The purpose of this contract is to own a BNS legacy name, and only allow owners
of the equivalent name on BNSx to control the legacy name.

For example, if a wrapper contract owns `name.btc`, and Alice owns `name.btc` on
BNSx, then only Alice can interact with this contract.

**Public functions:**

- [`unwrap`](#unwrap)
- [`name-update`](#name-update)

**Read-only functions:**

- [`get-own-name`](#get-own-name)
- [`get-name-info`](#get-name-info)
- [`get-owner`](#get-owner)
- [`get-wrapper-id`](#get-wrapper-id)

**Private functions:**

- [`register-self`](#register-self)

**Maps**

**Variables**

- [`wrapper-id-var`](#wrapper-id-var)

**Constants**

- [`ERR_NO_NAME`](#ERR_NO_NAME)
- [`ERR_NAME_TRANSFER`](#ERR_NAME_TRANSFER)
- [`ERR_UNAUTHORIZED`](#ERR_UNAUTHORIZED)
- [`ERR_NOT_WRAPPED`](#ERR_NOT_WRAPPED)

## Functions

### unwrap

[View in file](../contracts/contracts/name-wrapper.clar#L29)

`(define-public (unwrap ((recipient (optional principal))) (response (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal)) uint))`

Unwrap the legacy BNS name from this contract.

When unwrapping, the BNSx name is burned. This ensures that there is a 1-to-1
mapping between BNSx and BNS legacy names.

@throws if called by anyone other than the BNSx name owner

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
    (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bnsx-registry burn (get id props)))
    (unwrap! (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace props) (get name props) new-owner none)) ERR_NAME_TRANSFER)
    (ok props)
  )
)
```

</details>

**Parameters:**

| Name      | Type                 | Description                                                                                                                     |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| recipient | (optional principal) | the name owner can optionally transfer the BNS legacy name to a different account. If `none`, recipient defauls to `tx-sender`. |

### get-own-name

[View in file](../contracts/contracts/name-wrapper.clar#L44)

`(define-read-only (get-own-name () (response (tuple (name (buff 48)) (namespace (buff 20))) uint))`

Helper method to fetch the BNS legacy name owned by this contract.

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-own-name)
  (ok (unwrap! (contract-call? 'SP000000000000000000002Q6VF78.bns resolve-principal (as-contract tx-sender)) ERR_NO_NAME))
)
```

</details>

### get-name-info

[View in file](../contracts/contracts/name-wrapper.clar#L51)

`(define-read-only (get-name-info () (response (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal)) uint))`

Helper method to fetch information about the BNSx name that is equivalent to the
legacy name owned by this contract. For example, if this contract owns
`name.btc`, it returns the properties of `name.btc` on BNSx.

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-info)
  (let
    (
      (name (try! (get-own-name)))
      (props (unwrap! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.bnsx-registry get-name-properties name) ERR_NOT_WRAPPED))
    )
    (ok props)
  )
)
```

</details>

### get-owner

[View in file](../contracts/contracts/name-wrapper.clar#L63)

`(define-read-only (get-owner () (response principal uint))`

Helper method to return the owner of the BNSx name that is equivalent to this
contract's legacy name

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-owner)
  (ok (get owner (try! (get-name-info))))
)
```

</details>

### name-update

[View in file](../contracts/contracts/name-wrapper.clar#L70)

`(define-public (name-update ((namespace (buff 20)) (name (buff 48)) (zonefile-hash (buff 20))) (response bool uint))`

Helper method to interact with legacy BNS to update the zonefile for this name

@throws if called by anyone other than the BNSx name owner

<details>
  <summary>Source code:</summary>

```clarity
(define-public (name-update (namespace (buff 20)) (name (buff 48)) (zonefile-hash (buff 20)))
  (let
    (
      (props (try! (get-name-info)))
    )
    (asserts! (is-eq tx-sender (get owner props)) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get namespace props) namespace) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get name props) name) ERR_UNAUTHORIZED)
    (match (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-update namespace name zonefile-hash))
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
| namespace     | (buff 20) |             |
| name          | (buff 48) |             |
| zonefile-hash | (buff 20) |             |

### get-wrapper-id

[View in file](../contracts/contracts/name-wrapper.clar#L85)

`(define-read-only (get-wrapper-id () (optional uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-wrapper-id)
  (var-get wrapper-id-var)
)
```

</details>

### register-self

[View in file](../contracts/contracts/name-wrapper.clar#L89)

`(define-private (register-self () (response uint uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (register-self)
  (let
    (
      (self (as-contract tx-sender))
      (id (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrapper-migrator register-wrapper self)))
    )
    (var-set wrapper-id-var (some id))
    (ok id)
  )
)
```

</details>

## Maps

## Variables

### wrapper-id-var

(optional uint)

```clarity
(define-data-var wrapper-id-var (optional uint) none)
```

[View in file](../contracts/contracts/name-wrapper.clar#L18)

## Constants

### ERR_NO_NAME

```clarity
(define-constant ERR_NO_NAME (err u10000))
```

[View in file](../contracts/contracts/name-wrapper.clar#L13)

### ERR_NAME_TRANSFER

```clarity
(define-constant ERR_NAME_TRANSFER (err u10001))
```

[View in file](../contracts/contracts/name-wrapper.clar#L14)

### ERR_UNAUTHORIZED

```clarity
(define-constant ERR_UNAUTHORIZED (err u10002))
```

[View in file](../contracts/contracts/name-wrapper.clar#L15)

### ERR_NOT_WRAPPED

```clarity
(define-constant ERR_NOT_WRAPPED (err u10003))
```

[View in file](../contracts/contracts/name-wrapper.clar#L16)
