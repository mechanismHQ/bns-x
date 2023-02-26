# proposal-bootstrap

[`proposal-bootstrap.clar`](../contracts/proposals/proposal-bootstrap.clar)

**Public functions:**

- [`execute`](#execute)

**Read-only functions:**

**Private functions:**

- [`add-bootstrap-utils`](#add-bootstrap-utils)

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
    (try! (add-bootstrap-utils))

    (try! (contract-call? .bnsx-extensions set-extension-roles
      (list
        { extension: .wrapper-migrator, enabled: true, role: "registry" }
      )
    ))

    ;; mainnet
    ;; (try! (contract-call? .bnsx-registry mng-set-token-uri "https://api.bns.xyz/nft-metadata/{id}"))
    ;; (try! (contract-call? .wrapper-migrator set-signers (list  
    ;;   { signer: 0x65a660401398c30c63a9ffd69e933b87fd39ce0d, enabled: true }
    ;; )))

    (ok true)
  )
)
```

</details>

**Parameters:**

| Name   | Type      | Description |
| ------ | --------- | ----------- |
| sender | principal |             |

### add-bootstrap-utils

[View in file](../contracts/proposals/proposal-bootstrap.clar#L25)

`(define-private (add-bootstrap-utils () (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (add-bootstrap-utils)
  (begin
    (try! (contract-call? .bnsx-extensions set-extensions 
      (list 
        { extension: DEPLOYER, enabled: true }
        ;; { extension: 'SPRG2XNKCEV40EMASB8TG3B599ATHPRWRWSM4EB7.xsafe, enabled: true }
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
