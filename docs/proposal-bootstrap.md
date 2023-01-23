# proposal-bootstrap

[`proposal-bootstrap.clar`](../contracts/proposals/proposal-bootstrap.clar)

**Public functions:**

- [`execute`](#execute)

**Read-only functions:**

**Private functions:**

- [`add-test-utils`](#add-test-utils)

**Maps**

**Variables**

**Constants**

- [`DEPLOYER`](#DEPLOYER)

## Functions

### execute

[View in file](../contracts/proposals/proposal-bootstrap.clar#L5)

`(define-public (execute ((sender principal)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (execute (sender principal))
  (begin
    ;; Enable genesis extensions
    ;; (try! (contract-call? .executor-dao set-extensions
    ;;   (list
    ;;   )
    ;; ))
    ;; WORKAROUND PRE-2.1
    ;; NOT IN PROD
    (try! (add-test-utils))
    ;; (and (not is-in-mainnet) (try! (add-test-utils)))

    (try! (contract-call? .executor-dao set-extension-roles
      (list
        { extension: .wrapper-migrator, enabled: true, role: "registry" }
      )
    ))

    (ok true)
  )
)
```

</details>

**Parameters:**

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| sender | principal |             |

### add-test-utils

[View in file](../contracts/proposals/proposal-bootstrap.clar#L27)

`(define-private (add-test-utils () (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (add-test-utils)
  (begin
    ;; workaround for https://github.com/stacks-network/stacks-blockchain/pull/3440

    (try! (contract-call? .executor-dao set-extensions 
      (list 
        { extension: DEPLOYER, enabled: true }
        { extension: .test-utils, enabled: true }
      )
    ))
    (ok true)
  )
)
```

</details>

## Maps

## Variables

## Constants

### DEPLOYER

```clarity
(define-constant DEPLOYER tx-sender)
```

[View in file](../contracts/proposals/proposal-bootstrap.clar#L3)
