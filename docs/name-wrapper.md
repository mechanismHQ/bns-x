# name-wrapper

[`name-wrapper.clar`](../contracts/name-wrapper.clar)

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

**Private functions:**

## Functions

### unwrap

[View in file](../contracts/name-wrapper.clar#L27)

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
    (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry burn (get id props)))
    (unwrap! (as-contract (contract-call? 'SP000000000000000000002Q6VF78.bns name-transfer (get namespace props) (get name props) new-owner none)) ERR_NAME_TRANSFER)
    (ok props)
  )
)
```

</details>

**Parameters:**

| Name                                                              | Type                 | Description                                                   |
| ----------------------------------------------------------------- | -------------------- | ------------------------------------------------------------- |
| recipient                                                         | (optional principal) | the name owner can optionally transfer the BNS legacy name to |
| a different account. If `none`, recipient defauls to `tx-sender`. |                      |                                                               |

### get-own-name

[View in file](../contracts/name-wrapper.clar#L42)

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

[View in file](../contracts/name-wrapper.clar#L49)

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
      (props (unwrap! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry get-name-properties name) ERR_NOT_WRAPPED))
    )
    (ok props)
  )
)
```

</details>

### get-owner

[View in file](../contracts/name-wrapper.clar#L61)

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

[View in file](../contracts/name-wrapper.clar#L68)

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
