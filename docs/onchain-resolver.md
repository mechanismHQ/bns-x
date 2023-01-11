# onchain-resolver

[`onchain-resolver.clar`](../contracts/onchain-resolver.clar)

**Public functions:**

- [`emit-zonefile`](#emit-zonefile)
- [`set-zonefile`](#set-zonefile)

**Read-only functions:**

- [`resolve-zonefile`](#resolve-zonefile)
- [`resolve-zonefile-for-name`](#resolve-zonefile-for-name)

**Private functions:**

## Functions

### emit-zonefile

[View in file](../contracts/onchain-resolver.clar#L5)

`(define-public (emit-zonefile ((zonefile (buff 102400))) (response bool none))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (emit-zonefile (zonefile (buff 102400)))
  (begin
    (print zonefile)
    (ok true)
  ) 
)
```

</details>

**Parameters:**

| Name     | Type          | Description |
| -------- | ------------- | ----------- |
| zonefile | (buff 102400) |             |

### set-zonefile

[View in file](../contracts/onchain-resolver.clar#L12)

`(define-public (set-zonefile ((id uint) (zonefile (buff 2048))) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-zonefile (id uint) (zonefile (buff 2048)))
  (let
    (
      (owner (contract-call? .name-registry get-name-owner id))
    )
    ;; #[filter(zonefile)]
    (asserts! (is-eq (some tx-sender) owner) ERR_UNAUTHORIZED)
    (print {
      topic: "set-zonefile-onchain",
      zonefile: zonefile,
      id: id,
    })
    (map-set zonefiles-map id zonefile)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name     | Type        | Description |
| -------- | ----------- | ----------- |
| id       | uint        |             |
| zonefile | (buff 2048) |             |

### resolve-zonefile

[View in file](../contracts/onchain-resolver.clar#L29)

`(define-read-only (resolve-zonefile ((id uint)) (optional (buff 2048)))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (resolve-zonefile (id uint))
  (map-get? zonefiles-map id)
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### resolve-zonefile-for-name

[View in file](../contracts/onchain-resolver.clar#L33)

`(define-read-only (resolve-zonefile-for-name ((name (buff 48)) (namespace (buff 20))) (optional (buff 2048)))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (resolve-zonefile-for-name (name (buff 48)) (namespace (buff 20)))
  (match (contract-call? .name-registry get-id-for-name { name: name, namespace: namespace })
    id (resolve-zonefile id)
    none
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| name      | (buff 48) |             |
| namespace | (buff 20) |             |
