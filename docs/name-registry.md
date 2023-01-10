# name-registry

[`name-registry.clar`](../contracts/core/name-registry.clar)

**Public functions:**

- [`is-dao-or-extension`](#is-dao-or-extension)
- [`register`](#register)
- [`set-primary-name`](#set-primary-name)
- [`burn`](#burn)
- [`dao-set-token-uri`](#dao-set-token-uri)
- [`transfer`](#transfer)
- [`remove-dao-namespace-manager`](#remove-dao-namespace-manager)
- [`mng-transfer`](#mng-transfer)
- [`mng-burn`](#mng-burn)
- [`set-namespace-manager`](#set-namespace-manager)
- [`set-namespace-transfers-allowed`](#set-namespace-transfers-allowed)

**Read-only functions:**

- [`get-name-properties`](#get-name-properties)
- [`get-name-properties-by-id`](#get-name-properties-by-id)
- [`get-primary-name`](#get-primary-name)
- [`get-primary-name-properties`](#get-primary-name-properties)
- [`get-id-for-name`](#get-id-for-name)
- [`get-namespace-for-id`](#get-namespace-for-id)
- [`get-last-token-id`](#get-last-token-id)
- [`get-token-uri`](#get-token-uri)
- [`get-owner`](#get-owner)
- [`get-balance`](#get-balance)
- [`get-balance-of`](#get-balance-of)
- [`can-dao-manage-ns`](#can-dao-manage-ns)
- [`validate-namespace-action`](#validate-namespace-action)
- [`validate-namespace-action-by-id`](#validate-namespace-action-by-id)
- [`is-namespace-manager`](#is-namespace-manager)
- [`are-transfers-allowed`](#are-transfers-allowed)
- [`get-next-node-id`](#get-next-node-id)

**Private functions:**

- [`transfer-ownership`](#transfer-ownership)
- [`merge-name-props`](#merge-name-props)
- [`increment-id`](#increment-id)
- [`add-node`](#add-node)
- [`print-primary-update`](#print-primary-update)
- [`remove-node`](#remove-node)
- [`set-first`](#set-first)

## Functions

### is-dao-or-extension

[View in file](../contracts/core/name-registry.clar#L45)

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

### register

[View in file](../contracts/core/name-registry.clar#L59)

`(define-public (register ((name (tuple (name (buff 48)) (namespace (buff 20)))) (owner principal)) (response uint uint))`

Register a name in the registry

If the owner does not have a primary name, this name will be set as their
primary

@throws if not called by an authorized contract

@throws if the name is already registered

<details>
  <summary>Source code:</summary>

```clarity
(define-public (register
    (name { name: (buff 48), namespace: (buff 20) })
    (owner principal)
  )
  (let
    (
      (id (increment-id))
    )
    (try! (validate-namespace-action (get namespace name)))
    (asserts! (map-insert name-id-map name id) ERR_ALREADY_REGISTERED)
    (asserts! (map-insert id-name-map id name) ERR_ALREADY_REGISTERED)
    (asserts! (map-insert name-owner-map id owner) ERR_ALREADY_REGISTERED)
    (print {
      topic: "new-name",
      owner: owner,
      name: name,
      id: id,
    })
    (unwrap-panic (nft-mint? names id owner))
    (add-node owner id)
    (ok id)
  )
)
```

</details>

**Parameters:**

| Name  | Type                                           | Description |
| ----- | ---------------------------------------------- | ----------- |
| name  | (tuple (name (buff 48)) (namespace (buff 20))) |             |
| owner | principal                                      |             |

### set-primary-name

[View in file](../contracts/core/name-registry.clar#L83)

`(define-public (set-primary-name ((id uint)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-primary-name (id uint))
  (let
    (
      (owner (unwrap! (map-get? name-owner-map id) ERR_INVALID_ID))
    )
    (asserts! (is-eq owner tx-sender) ERR_UNAUTHORIZED)
    (try! (set-first tx-sender id))
    (print {
      topic: "set-primary",
      id: id,
      owner: owner,
    })
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### burn

[View in file](../contracts/core/name-registry.clar#L99)

`(define-public (burn ((id uint)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (burn (id uint))
  (let
    (
      (name (unwrap-panic (map-get? id-name-map id)))
    )
    (asserts! (is-eq (some tx-sender)
      (map-get? name-owner-map id))
      ERR_NOT_OWNER)
    (remove-node tx-sender id)
    (try! (nft-burn? names id tx-sender))
    (map-delete name-id-map name)
    (map-delete id-name-map id)
    (map-delete name-owner-map id)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### transfer-ownership

[View in file](../contracts/core/name-registry.clar#L116)

`(define-private (transfer-ownership ((id uint) (sender principal) (recipient principal)) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (transfer-ownership (id uint) (sender principal) (recipient principal))
  ;; #[allow(unchecked_data)]
  (begin
    (map-set name-owner-map id recipient)
    (unwrap-panic (nft-transfer? names id sender recipient))
    (print {
      topic: "transfer-ownership",
      id: id,
      recipient: recipient,
    })
    (remove-node sender id)
    (add-node recipient id)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| id        | uint      |             |
| sender    | principal |             |
| recipient | principal |             |

### get-name-properties

[View in file](../contracts/core/name-registry.clar#L133)

`(define-read-only (get-name-properties ((name (tuple (name (buff 48)) (namespace (buff 20))))) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-properties (name { name: (buff 48), namespace: (buff 20) }))
  (match (map-get? name-id-map name)
    id (merge-name-props name id)
    none
  )
)
```

</details>

**Parameters:**

| Name | Type                                           | Description |
| ---- | ---------------------------------------------- | ----------- |
| name | (tuple (name (buff 48)) (namespace (buff 20))) |             |

### get-name-properties-by-id

[View in file](../contracts/core/name-registry.clar#L140)

`(define-read-only (get-name-properties-by-id ((id uint)) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-properties-by-id (id uint))
  (match (map-get? id-name-map id)
    name (merge-name-props name id)
    none
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### merge-name-props

[View in file](../contracts/core/name-registry.clar#L148)

`(define-private (merge-name-props ((name (tuple (name (buff 48)) (namespace (buff 20)))) (id uint)) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

#[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-private (merge-name-props (name { name: (buff 48), namespace: (buff 20) }) (id uint))
  (some (merge name {
    id: id,
    owner: (unwrap-panic (map-get? name-owner-map id))
  }))
)
```

</details>

**Parameters:**

| Name | Type                                           | Description |
| ---- | ---------------------------------------------- | ----------- |
| name | (tuple (name (buff 48)) (namespace (buff 20))) |             |
| id   | uint                                           |             |

### get-primary-name

[View in file](../contracts/core/name-registry.clar#L155)

`(define-read-only (get-primary-name ((account principal)) (optional (tuple (name (buff 48)) (namespace (buff 20)))))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-primary-name (account principal))
  (match (map-get? owner-primary-name-map account)
    id (map-get? id-name-map id)
    none
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |

### get-primary-name-properties

[View in file](../contracts/core/name-registry.clar#L162)

`(define-read-only (get-primary-name-properties ((account principal)) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-primary-name-properties (account principal))
  (match (map-get? owner-primary-name-map account)
    id (get-name-properties-by-id id)
    none
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |

### get-id-for-name

[View in file](../contracts/core/name-registry.clar#L169)

`(define-read-only (get-id-for-name ((name (tuple (name (buff 48)) (namespace (buff 20))))) (optional uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-id-for-name (name { name: (buff 48), namespace: (buff 20) }))
  (map-get? name-id-map name)
)
```

</details>

**Parameters:**

| Name | Type                                           | Description |
| ---- | ---------------------------------------------- | ----------- |
| name | (tuple (name (buff 48)) (namespace (buff 20))) |             |

### get-namespace-for-id

[View in file](../contracts/core/name-registry.clar#L173)

`(define-read-only (get-namespace-for-id ((id uint)) (response (buff 20) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-namespace-for-id (id uint))
  (ok (get namespace (unwrap! (map-get? id-name-map id) ERR_INVALID_ID)))
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### dao-set-token-uri

[View in file](../contracts/core/name-registry.clar#L180)

`(define-public (dao-set-token-uri ((uri (string-ascii 256))) (response bool uint))`

#[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-public (dao-set-token-uri (uri (string-ascii 256)))
  (begin
    (try! (is-dao-or-extension))
    (ok (var-set token-uri-var uri))
  )
)
```

</details>

**Parameters:**

| Name | Type               | Description |
| ---- | ------------------ | ----------- |
| uri  | (string-ascii 256) |             |

### get-last-token-id

[View in file](../contracts/core/name-registry.clar#L189)

`(define-read-only (get-last-token-id () (response uint none))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-last-token-id)
  (let ((last (var-get last-id-var)))
    (ok (if (is-eq last u0) u0 (- last u1)))
  )
)
```

</details>

### get-token-uri

[View in file](../contracts/core/name-registry.clar#L195)

`(define-read-only (get-token-uri () (response (string-ascii 256) none))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-token-uri)
  (ok (var-get token-uri-var))
)
```

</details>

### get-owner

[View in file](../contracts/core/name-registry.clar#L199)

`(define-read-only (get-owner ((id uint)) (response (optional principal) none))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? names id))
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### get-balance

[View in file](../contracts/core/name-registry.clar#L203)

`(define-read-only (get-balance ((account principal)) uint)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? owner-balance-map account))
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |

### get-balance-of

[View in file](../contracts/core/name-registry.clar#L206)

`(define-read-only (get-balance-of ((account principal)) (response uint none))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-balance-of (account principal)) (ok (get-balance account)))
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |

### transfer

[View in file](../contracts/core/name-registry.clar#L209)

`(define-public (transfer ((id uint) (sender principal) (recipient principal)) (response bool uint))`

TODO: flag for if namespace can be transfered

<details>
  <summary>Source code:</summary>

```clarity
(define-public (transfer (id uint) (sender principal) (recipient principal))
  (let
    (
      (owner (unwrap! (map-get? name-owner-map id) ERR_NOT_OWNER))
    )
    (asserts! (is-eq tx-sender owner) ERR_NOT_OWNER)
    (asserts! (is-eq owner sender) ERR_NOT_OWNER)
    (asserts! (are-transfers-allowed (try! (get-namespace-for-id id))) ERR_TRANSFER_BLOCKED)
    ;; #[filter(recipient)]
    (transfer-ownership id sender recipient)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| id        | uint      |             |
| sender    | principal |             |
| recipient | principal |             |

### can-dao-manage-ns

[View in file](../contracts/core/name-registry.clar#L225)

`(define-read-only (can-dao-manage-ns ((namespace (buff 20))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (can-dao-manage-ns (namespace (buff 20)))
  (default-to true (map-get? dao-namespace-manager-map namespace))
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### remove-dao-namespace-manager

[View in file](../contracts/core/name-registry.clar#L229)

`(define-public (remove-dao-namespace-manager ((namespace (buff 20))) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (remove-dao-namespace-manager (namespace (buff 20)))
  (begin
    ;; #[filter(namespace)]
    (try! (is-dao-or-extension))
    (map-set dao-namespace-manager-map namespace false)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### validate-namespace-action

[View in file](../contracts/core/name-registry.clar#L244)

`(define-read-only (validate-namespace-action ((namespace (buff 20))) (response bool uint))`

Authorization check for namespace action.

If `contract-caller` is a manager: OK Otherwise:

- Ensure that DAO is allowed to manage namespace
- Check that caller is an authorized extension

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (validate-namespace-action (namespace (buff 20)))
  (if (is-namespace-manager namespace contract-caller) (ok true)
    (if (can-dao-manage-ns namespace)
      (is-dao-or-extension)
      ERR_UNAUTHORIZED
    )
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### validate-namespace-action-by-id

[View in file](../contracts/core/name-registry.clar#L254)

`(define-read-only (validate-namespace-action-by-id ((id uint)) (response bool uint))`

#[filter(id)]

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (validate-namespace-action-by-id (id uint))
  (validate-namespace-action (try! (get-namespace-for-id id)))
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### is-namespace-manager

[View in file](../contracts/core/name-registry.clar#L258)

`(define-read-only (is-namespace-manager ((namespace (buff 20)) (manager principal)) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-namespace-manager (namespace (buff 20)) (manager principal))
  (default-to false (map-get? namespace-managers-map { namespace: namespace, manager: manager }))
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |
| manager   | principal |             |

### mng-transfer

[View in file](../contracts/core/name-registry.clar#L262)

`(define-public (mng-transfer ((id uint) (recipient principal)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (mng-transfer (id uint) (recipient principal))
  (begin
    ;; #[filter(id, recipient)]
    (try! (validate-namespace-action-by-id id))
    (transfer-ownership id (unwrap-panic (map-get? name-owner-map id)) recipient)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| id        | uint      |             |
| recipient | principal |             |

### mng-burn

[View in file](../contracts/core/name-registry.clar#L272)

`(define-public (mng-burn ((id uint)) (response bool uint))`

TODO

<details>
  <summary>Source code:</summary>

```clarity
(define-public (mng-burn (id uint))
  (begin
    (try! (validate-namespace-action-by-id id))
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### set-namespace-manager

[View in file](../contracts/core/name-registry.clar#L279)

`(define-public (set-namespace-manager ((namespace (buff 20)) (manager principal) (enabled bool)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-namespace-manager (namespace (buff 20)) (manager principal) (enabled bool))
  (begin
    ;; #[filter(namespace, manager)]
    (try! (validate-namespace-action namespace))
    (map-set namespace-managers-map { namespace: namespace, manager: manager } enabled)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |
| manager   | principal |             |
| enabled   | bool      |             |

### set-namespace-transfers-allowed

[View in file](../contracts/core/name-registry.clar#L288)

`(define-public (set-namespace-transfers-allowed ((namespace (buff 20)) (enabled bool)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-namespace-transfers-allowed (namespace (buff 20)) (enabled bool))
  (begin
    ;; #[filter(namespace)]
    (try! (validate-namespace-action namespace))
    (map-set namespace-transfers-allowed namespace enabled)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |
| enabled   | bool      |             |

### are-transfers-allowed

[View in file](../contracts/core/name-registry.clar#L297)

`(define-read-only (are-transfers-allowed ((namespace (buff 20))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (are-transfers-allowed (namespace (buff 20)))
  (default-to true (map-get? namespace-transfers-allowed namespace))
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### increment-id

[View in file](../contracts/core/name-registry.clar#L303)

`(define-private (increment-id () uint)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (increment-id)
  (let
    (
      (last (var-get last-id-var))
    )
    (var-set last-id-var (+ last u1))
    last
  )
)
```

</details>

### get-next-node-id

[View in file](../contracts/core/name-registry.clar#L317)

`(define-read-only (get-next-node-id ((id uint)) (optional uint))`

Helper to traverse names

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-next-node-id (id uint))
  (map-get? owner-name-next-map id)
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### add-node

[View in file](../contracts/core/name-registry.clar#L322)

`(define-private (add-node ((account principal) (id uint)) bool)`

#[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-private (add-node (account principal) (id uint))
  (let
    (
      (last-opt (map-get? owner-last-name-map account))
    )
    (map-set owner-balance-map account (+ (get-balance account) u1))
    (print-primary-update account (some id))
    ;; Set "first" if it doesnt exist
    (map-insert owner-primary-name-map account id)
    (map-set owner-last-name-map account id)
    (match last-opt
      last (begin
        (map-set owner-name-next-map last id)
        (map-set owner-name-prev-map id last)
      )
      true
    )
    true
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |
| id      | uint      |             |

### print-primary-update

[View in file](../contracts/core/name-registry.clar#L343)

`(define-private (print-primary-update ((account principal) (id (optional uint))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (print-primary-update (account principal) (id (optional uint)))
  (begin
    (print {
      topic: "primary-update",
      id: id,
      account: account,
      prev: (map-get? owner-primary-name-map account)
    })
    true
  )
)
```

</details>

**Parameters:**

| Name    | Type            | Description |
| ------- | --------------- | ----------- |
| account | principal       |             |
| id      | (optional uint) |             |

### remove-node

[View in file](../contracts/core/name-registry.clar#L355)

`(define-private (remove-node ((account principal) (id uint)) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (remove-node (account principal) (id uint))
  (let
    (
      (prev-opt (map-get? owner-name-prev-map id))
      (next-opt (map-get? owner-name-next-map id))
      (first (unwrap-panic (map-get? owner-primary-name-map account)))
      (last (unwrap-panic (map-get? owner-last-name-map account)))
      (balance (unwrap-panic (map-get? owner-balance-map account)))
    )
    (print {topic: "remove", account: account})
    ;; #[filter(account)]
    (map-set owner-balance-map account (- balance u1))

    ;; We're removing the first
    (and (is-eq first id)
      (if (is-some next-opt)
        (and
          (print-primary-update account next-opt)
          (map-set owner-primary-name-map account (unwrap-panic next-opt))
        )
        (and
          (print-primary-update account none)
          (map-delete owner-primary-name-map account)
        )
      )
      ;; (map-delete owner-primary-name-map account)
    )
    ;; removing the last
    (and (is-eq last id)
      (if (is-some prev-opt)
        (map-set owner-last-name-map account (unwrap-panic prev-opt))
        ;; Removing the _only_ node:
        (map-delete owner-last-name-map account)
      )
    )
    (match next-opt
      next (if (is-some prev-opt)
        (map-set owner-name-prev-map next (unwrap-panic prev-opt))
        (map-delete owner-name-prev-map next)
      )
      true
    )
    (match prev-opt
      prev (if (is-some next-opt)
        (map-set owner-name-next-map prev (unwrap-panic next-opt))
        (map-delete owner-name-next-map prev)
      )
      true
    )
    (map-delete owner-name-next-map id)
    (map-delete owner-name-prev-map id)

    true
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |
| id      | uint      |             |

### set-first

[View in file](../contracts/core/name-registry.clar#L411)

`(define-private (set-first ((account principal) (node uint)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (set-first (account principal) (node uint))
  (let
    (
      (first (unwrap! (map-get? owner-primary-name-map account) ERR_CANNOT_SET_PRIMARY))
    )
    ;; make sure this isn't the existing first
    (asserts! (not (is-eq first node)) ERR_CANNOT_SET_PRIMARY)
    (remove-node account node)
    (print-primary-update account (some node))
    (map-set owner-primary-name-map account node)
    (map-set owner-name-prev-map first node)
    (map-set owner-name-next-map node first)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| account | principal |             |
| node    | uint      |             |
