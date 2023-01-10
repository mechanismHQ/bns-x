# test-utils

[`test-utils.clar`](../contracts/test-utils.clar)

ONLY FOR USE IN TESTS

**Public functions:**

- [`name-register`](#name-register)
- [`v1-register`](#v1-register)
- [`v1-register-transfer`](#v1-register-transfer)

**Read-only functions:**

**Private functions:**

- [`is-deployer`](#is-deployer)

## Functions

### is-deployer

[View in file](../contracts/test-utils.clar#L7)

`(define-private (is-deployer () (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (is-deployer)
  (begin
    (asserts! (is-eq tx-sender deployer) ERR_UNAUTHORIZED)
    (asserts! (not is-in-mainnet) ERR_UNAUTHORIZED)
    (ok true)
  )

)
```

</details>

### name-register

[View in file](../contracts/test-utils.clar#L16)

`(define-public (name-register ((name (buff 48)) (namespace (buff 20)) (owner principal)) (response uint uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (name-register
    (name (buff 48))
    (namespace (buff 20))
    (owner principal)
  )
  (begin
    (try! (is-deployer))
    (contract-call? .name-registry register
      {
        name: name,
        namespace: namespace,
      }
      owner
    )
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| name      | (buff 48) |             |
| namespace | (buff 20) |             |
| owner     | principal |             |

### v1-register

[View in file](../contracts/test-utils.clar#L33)

`(define-public (v1-register ((name (buff 48)) (namespace (buff 20))) (response bool int))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (v1-register (name (buff 48)) (namespace (buff 20)))
  (let
    (
      ;; (transfer-ok (try! (stx-transfer? u100000 (as-contract tx-sender) tx-sender)))
      (salt 0x00)
      (hashed (hash160 (concat (concat (concat name 0x2e) namespace) salt)))
    )
    (try! (contract-call? 'ST000000000000000000002AMW42H.bns name-preorder hashed u100000))

    (try! (contract-call? 'ST000000000000000000002AMW42H.bns name-register namespace name salt 0x00))
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| name      | (buff 48) |             |
| namespace | (buff 20) |             |

### v1-register-transfer

[View in file](../contracts/test-utils.clar#L47)

`(define-public (v1-register-transfer ((name (buff 48)) (namespace (buff 20)) (recipient principal)) (response bool int))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (v1-register-transfer (name (buff 48)) (namespace (buff 20)) (recipient principal))
  (begin
    (try! (v1-register name namespace))
    (try! (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer namespace name recipient none))
    (match (stx-transfer? u1000000 tx-sender recipient)
      r (ok true)
      e (err (to-int e))
    )
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| name      | (buff 48) |             |
| namespace | (buff 20) |             |
| recipient | principal |             |
