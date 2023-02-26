# bnsx-registry

[`name-registry.clar`](../contracts/core/name-registry.clar)

The name registry contract acts as the central hub for storing name information.
Each 'name' record has two parts - the 'name' (domain) and the 'namespace'
(TLD). Each record has a unique ID, which is an integer.

Registering a new name is not publicly exposed through this contract. Instead,
registrations must be initiated via a different contract. The originating
contract must have the "registry" role in the
[`.bnsx-extensions`](`../bnsx-extension.md`) contract.

The name registry includes functionality for "managed namespaces". A managed
namespace is controlled by an external set of contracts - such as a separate
DAO. The set namespace/manager relationships is stored in this contract. If a
namespace has a 'manager', that manager is allowed to call privileged functions
for names in their namespace.

This contract keeps track of an account's "primary name", as well as their other
names, in a linked list data structure. This allows for querying the entire set
of an account's names. If an account has at least one name, they will always
have a 'primary' name. If their primary name is transfered, the next name in the
linked list is automatically set as the primary.

This contract also exposes an NFT asset, which represents ownership of a given
name. The contract exposes a SIP9-compatible interface for interacting with the
NFT.

**Public functions:**

- [`register`](#register)
- [`set-primary-name`](#set-primary-name)
- [`burn`](#burn)
- [`mng-set-token-uri`](#mng-set-token-uri)
- [`mng-set-namespace-token-uri`](#mng-set-namespace-token-uri)
- [`transfer`](#transfer)
- [`remove-dao-namespace-manager`](#remove-dao-namespace-manager)
- [`mng-transfer`](#mng-transfer)
- [`mng-burn`](#mng-burn)
- [`set-namespace-manager`](#set-namespace-manager)
- [`set-namespace-transfers-allowed`](#set-namespace-transfers-allowed)

**Read-only functions:**

- [`is-dao-or-extension`](#is-dao-or-extension)
- [`get-name-properties`](#get-name-properties)
- [`get-name-properties-by-id`](#get-name-properties-by-id)
- [`get-primary-name`](#get-primary-name)
- [`get-primary-name-properties`](#get-primary-name-properties)
- [`get-id-for-name`](#get-id-for-name)
- [`get-namespace-for-id`](#get-namespace-for-id)
- [`get-name-owner`](#get-name-owner)
- [`get-last-token-id`](#get-last-token-id)
- [`get-token-uri`](#get-token-uri)
- [`get-token-uri-for-namespace`](#get-token-uri-for-namespace)
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

- [`burn-name`](#burn-name)
- [`transfer-ownership`](#transfer-ownership)
- [`merge-name-props`](#merge-name-props)
- [`increment-id`](#increment-id)
- [`add-node`](#add-node)
- [`print-primary-update`](#print-primary-update)
- [`remove-node`](#remove-node)
- [`set-first`](#set-first)

**Maps**

- [`namespace-token-uri-map`](#namespace-token-uri-map)
- [`namespace-managers-map`](#namespace-managers-map)
- [`dao-namespace-manager-map`](#dao-namespace-manager-map)
- [`namespace-transfers-allowed`](#namespace-transfers-allowed)
- [`owner-primary-name-map`](#owner-primary-name-map)
- [`owner-last-name-map`](#owner-last-name-map)
- [`owner-name-next-map`](#owner-name-next-map)
- [`owner-name-prev-map`](#owner-name-prev-map)
- [`name-owner-map`](#name-owner-map)
- [`name-id-map`](#name-id-map)
- [`id-name-map`](#id-name-map)
- [`name-encoding-map`](#name-encoding-map)
- [`owner-balance-map`](#owner-balance-map)

**Variables**

- [`last-id-var`](#last-id-var)
- [`token-uri-var`](#token-uri-var)

**Constants**

- [`ROLE`](#ROLE)
- [`ERR_UNAUTHORIZED`](#ERR_UNAUTHORIZED)
- [`ERR_ALREADY_REGISTERED`](#ERR_ALREADY_REGISTERED)
- [`ERR_CANNOT_SET_PRIMARY`](#ERR_CANNOT_SET_PRIMARY)
- [`ERR_INVALID_ID`](#ERR_INVALID_ID)
- [`ERR_EXPIRED`](#ERR_EXPIRED)
- [`ERR_TRANSFER_BLOCKED`](#ERR_TRANSFER_BLOCKED)
- [`ERR_NOT_OWNER`](#ERR_NOT_OWNER)

## Functions

### is-dao-or-extension

[View in file](../contracts/core/name-registry.clar#L67)

`(define-read-only (is-dao-or-extension () (response bool uint))`

Validate an action that can only be executed by a BNS X extension.

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-dao-or-extension)
  (ok (asserts! (or (is-eq tx-sender .bnsx-extensions) (contract-call? .bnsx-extensions has-role-or-extension contract-caller ROLE)) ERR_UNAUTHORIZED))
  ;; (ok (asserts! (contract-call? .bnsx-extensions has-role-or-extension contract-caller ROLE) ERR_UNAUTHORIZED))
)
```

</details>

### register

[View in file](../contracts/core/name-registry.clar#L81)

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
    (unwrap-panic (nft-mint? BNSx-Names id owner))
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

[View in file](../contracts/core/name-registry.clar#L109)

`(define-public (set-primary-name ((id uint)) (response bool uint))`

Set a name as a user's primary name. Only the owner of the name can set it as
their primary.

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

| Name | Type | Description        |
| ---- | ---- | ------------------ |
| id   | uint | the ID of the name |

### burn

[View in file](../contracts/core/name-registry.clar#L132)

`(define-public (burn ((id uint)) (response bool uint))`

Burn a name. This burns the name NFT and removes all ownership data.

If the name being burnt is the account's primary, and the account owns another
name, a different name is automatically set as the account's new primary.

@throws if not called by the owner

<details>
  <summary>Source code:</summary>

```clarity
(define-public (burn (id uint))
  (match (map-get? name-owner-map id)
    owner (begin
      (asserts! (is-eq tx-sender owner) ERR_NOT_OWNER)
      (burn-name id)
    )
    ERR_NOT_OWNER
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### burn-name

[View in file](../contracts/core/name-registry.clar#L144)

`(define-private (burn-name ((id uint)) (response bool uint))`

Private method to handle burning a name. See [`burn`](#burn) and
[`mng-burn`](#mng-burn)

<details>
  <summary>Source code:</summary>

```clarity
(define-private (burn-name (id uint))
  (let
    (
      (name (unwrap! (map-get? id-name-map id) ERR_INVALID_ID))
      (owner (unwrap-panic (map-get? name-owner-map id)))
    )
    (remove-node owner id)
    (try! (nft-burn? BNSx-Names id owner))
    (map-delete name-id-map name)
    (map-delete id-name-map id)
    (map-delete name-owner-map id)
    (print {
      topic: "burn",
      id: id,
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

### transfer-ownership

[View in file](../contracts/core/name-registry.clar#L165)

`(define-private (transfer-ownership ((id uint) (sender principal) (recipient principal)) bool)`

Private method to handle transfering ownership of a name. This updates internal
data tracking name ownership, and transfers the NFT to the recipient.

<details>
  <summary>Source code:</summary>

```clarity
(define-private (transfer-ownership (id uint) (sender principal) (recipient principal))
  ;; #[allow(unchecked_data)]
  (begin
    (map-set name-owner-map id recipient)
    (unwrap-panic (nft-transfer? BNSx-Names id sender recipient))
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

[View in file](../contracts/core/name-registry.clar#L188)

`(define-read-only (get-name-properties ((name (tuple (name (buff 48)) (namespace (buff 20))))) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

Get properties of a given name. Returns `optional` with the following
properties:

- id
- name
- namespace
- owner

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

[View in file](../contracts/core/name-registry.clar#L196)

`(define-read-only (get-name-properties-by-id ((id uint)) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

Get name properties of a name, with lookup via ID. See
[`get-name-properties`](#get-name-properties)

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

[View in file](../contracts/core/name-registry.clar#L204)

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

[View in file](../contracts/core/name-registry.clar#L213)

`(define-read-only (get-primary-name ((account principal)) (optional (tuple (name (buff 48)) (namespace (buff 20)))))`

Return the primary name for a given account. Returns an optional tuple with
`name` and `namespace`

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

[View in file](../contracts/core/name-registry.clar#L221)

`(define-read-only (get-primary-name-properties ((account principal)) (optional (tuple (id uint) (name (buff 48)) (namespace (buff 20)) (owner principal))))`

Return properties of an account's primary name. See
[`get-name-properties`](#get-name-properties)

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

[View in file](../contracts/core/name-registry.clar#L229)

`(define-read-only (get-id-for-name ((name (tuple (name (buff 48)) (namespace (buff 20))))) (optional uint))`

Reverse lookup the ID of a name

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

[View in file](../contracts/core/name-registry.clar#L235)

`(define-read-only (get-namespace-for-id ((id uint)) (response (buff 20) uint))`

Returns the namespace for a given name. Returns a `response` with the namespace,
or `ERR_INVALID_ID` otherwise.

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

### get-name-owner

[View in file](../contracts/core/name-registry.clar#L240)

`(define-read-only (get-name-owner ((id uint)) (optional principal))`

Returns the owner of a name

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-name-owner (id uint))
  (map-get? name-owner-map id)
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### mng-set-token-uri

[View in file](../contracts/core/name-registry.clar#L250)

`(define-public (mng-set-token-uri ((uri (string-ascii 256))) (response bool uint))`

Set the Token URI for NFT metadata.

@throws if called by an unauthorized contract #[allow(unchecked_data)]

<details>
  <summary>Source code:</summary>

```clarity
(define-public (mng-set-token-uri (uri (string-ascii 256)))
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

### mng-set-namespace-token-uri

[View in file](../contracts/core/name-registry.clar#L261)

`(define-public (mng-set-namespace-token-uri ((namespace (buff 20)) (uri (string-ascii 256))) (response bool uint))`

Set a namespace-specific metadata URI

<details>
  <summary>Source code:</summary>

```clarity
(define-public (mng-set-namespace-token-uri (namespace (buff 20)) (uri (string-ascii 256)))
  (begin
    ;; #[filter(namespace, uri)]
    (try! (validate-namespace-action namespace))
    (map-set namespace-token-uri-map namespace uri)
    (ok true)
  )
)
```

</details>

**Parameters:**

| Name      | Type               | Description                                          |
| --------- | ------------------ | ---------------------------------------------------- |
| namespace | (buff 20)          | the namespace to be associated with this URI         |
| uri       | (string-ascii 256) | a URI that returns valid metadata according to SIP16 |

### get-last-token-id

[View in file](../contracts/core/name-registry.clar#L272)

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

[View in file](../contracts/core/name-registry.clar#L284)

`(define-read-only (get-token-uri ((id uint)) (response (optional (string-ascii 256)) none))`

SIP9 - get a SIP16-valid token URI.

If the namespace for the name associated with `id` has a namespace-specific
token-uri, that URI is returned.

Otherwise, the contract's base token URI is returned.

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-token-uri (id uint))
  (let
    (
      (base-uri (var-get token-uri-var))
    )
    (match (get-namespace-for-id id)
      namespace (ok (some (default-to base-uri (get-token-uri-for-namespace namespace))))
      e (ok (some base-uri))
    )   
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### get-token-uri-for-namespace

[View in file](../contracts/core/name-registry.clar#L297)

`(define-read-only (get-token-uri-for-namespace ((namespace (buff 20))) (optional (string-ascii 256)))`

Fetch a namespace-specific token URI.

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-token-uri-for-namespace (namespace (buff 20)))
  (map-get? namespace-token-uri-map namespace)
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### get-owner

[View in file](../contracts/core/name-registry.clar#L302)

`(define-read-only (get-owner ((id uint)) (response (optional principal) none))`

SIP9 - fetch owner of an NFT

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? BNSx-Names id))
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### get-balance

[View in file](../contracts/core/name-registry.clar#L307)

`(define-read-only (get-balance ((account principal)) uint)`

Returns the total number of names owned by an account

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

[View in file](../contracts/core/name-registry.clar#L310)

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

[View in file](../contracts/core/name-registry.clar#L317)

`(define-public (transfer ((id uint) (sender principal) (recipient principal)) (response bool uint))`

Transfer a name

@throws if transfers are not allowed for a given namespace.

@throws if not called by the name owner

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

[View in file](../contracts/core/name-registry.clar#L334)

`(define-read-only (can-dao-manage-ns ((namespace (buff 20))) bool)`

Returns `bool` specifying whether BNS X contracts can manage a given namespace

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

[View in file](../contracts/core/name-registry.clar#L341)

`(define-public (remove-dao-namespace-manager ((namespace (buff 20))) (response bool uint))`

Removes the ability for BNS X contracts to manage a specific namespace. Once BNS
X is "ejected" from a namespace, only managers of that namespace can perform
name-related actions (like registration) for that namespace.

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

[View in file](../contracts/core/name-registry.clar#L356)

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

[View in file](../contracts/core/name-registry.clar#L366)

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

[View in file](../contracts/core/name-registry.clar#L371)

`(define-read-only (is-namespace-manager ((namespace (buff 20)) (manager principal)) bool)`

Returns `bool` of whether a principal is a valid manager for a given namespace.

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

[View in file](../contracts/core/name-registry.clar#L377)

`(define-public (mng-transfer ((id uint) (recipient principal)) (response bool uint))`

Privileged method for transfering a name. This allows external (authorized)
contracts to allow transfers based on flexible conditions.

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

[View in file](../contracts/core/name-registry.clar#L388)

`(define-public (mng-burn ((id uint)) (response bool uint))`

Privileged method for burning a name. This allows external contracts to allow
transfers based on flexible conditions.

<details>
  <summary>Source code:</summary>

```clarity
(define-public (mng-burn (id uint))
  (begin
    (try! (validate-namespace-action-by-id id))
    (burn-name id)
  )
)
```

</details>

**Parameters:**

| Name | Type | Description |
| ---- | ---- | ----------- |
| id   | uint |             |

### set-namespace-manager

[View in file](../contracts/core/name-registry.clar#L398)

`(define-public (set-namespace-manager ((namespace (buff 20)) (manager principal) (enabled bool)) (response bool uint))`

Add a manager for a specific namespace. Only BNS X contracts can set the first
manager. After that, existing managers can add other managers. See
[`validate-namespace-action`](#validate-namespace-action) for authorization
rules.

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

[View in file](../contracts/core/name-registry.clar#L409)

`(define-public (set-namespace-transfers-allowed ((namespace (buff 20)) (enabled bool)) (response bool uint))`

Enable or disable transfers of names for a specific namespace. See
[`validate-namespace-action`](#validate-namespace-action) for authorization
rules.

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

[View in file](../contracts/core/name-registry.clar#L419)

`(define-read-only (are-transfers-allowed ((namespace (buff 20))) bool)`

Returns a `bool` indicating whether transfers are allowed for a given namespace.

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

[View in file](../contracts/core/name-registry.clar#L425)

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

[View in file](../contracts/core/name-registry.clar#L439)

`(define-read-only (get-next-node-id ((id uint)) (optional uint))`

Helper method to traverse the linked list structure for an account's names.

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

[View in file](../contracts/core/name-registry.clar#L448)

`(define-private (add-node ((account principal) (id uint)) bool)`

Internal method for adding a node to an account's linked list of names. The name
is always added to the 'end' of the list. If this is the account's first name,
that means it will also be the primary name.

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

[View in file](../contracts/core/name-registry.clar#L471)

`(define-private (print-primary-update ((account principal) (id (optional uint))) bool)`

Internal method to indicate that an account's primary name has been updated.
This only prints out information, which can be indexed off-chain.

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

[View in file](../contracts/core/name-registry.clar#L484)

`(define-private (remove-node ((account principal) (id uint)) bool)`

Remove a name from an account's list of names.

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

[View in file](../contracts/core/name-registry.clar#L541)

`(define-private (set-first ((account principal) (node uint)) (response bool uint))`

Set a name as an account's primary. This internal method is updates the internal
data structure for an account's names.

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

## Maps

### namespace-token-uri-map

```clarity
(define-map namespace-token-uri-map (buff 20) (string-ascii 256))
```

[View in file](../contracts/core/name-registry.clar#L39)

### namespace-managers-map

```clarity
(define-map namespace-managers-map { manager: principal, namespace: (buff 20) } bool)
```

[View in file](../contracts/core/name-registry.clar#L41)

### dao-namespace-manager-map

```clarity
(define-map dao-namespace-manager-map (buff 20) bool)
```

[View in file](../contracts/core/name-registry.clar#L42)

### namespace-transfers-allowed

```clarity
(define-map namespace-transfers-allowed (buff 20) bool)
```

[View in file](../contracts/core/name-registry.clar#L43)

### owner-primary-name-map

linked list for account->names

```clarity
(define-map owner-primary-name-map principal uint)
```

[View in file](../contracts/core/name-registry.clar#L50)

### owner-last-name-map

```clarity
(define-map owner-last-name-map principal uint)
```

[View in file](../contracts/core/name-registry.clar#L51)

### owner-name-next-map

```clarity
(define-map owner-name-next-map uint uint)
```

[View in file](../contracts/core/name-registry.clar#L52)

### owner-name-prev-map

```clarity
(define-map owner-name-prev-map uint uint)
```

[View in file](../contracts/core/name-registry.clar#L53)

### name-owner-map

```clarity
(define-map name-owner-map uint principal)
```

[View in file](../contracts/core/name-registry.clar#L55)

### name-id-map

```clarity
(define-map name-id-map { name: (buff 48), namespace: (buff 20) } uint)
```

[View in file](../contracts/core/name-registry.clar#L57)

### id-name-map

```clarity
(define-map id-name-map uint { name: (buff 48), namespace: (buff 20) })
```

[View in file](../contracts/core/name-registry.clar#L58)

### name-encoding-map

```clarity
(define-map name-encoding-map uint (buff 1))
```

[View in file](../contracts/core/name-registry.clar#L60)

### owner-balance-map

```clarity
(define-map owner-balance-map principal uint)
```

[View in file](../contracts/core/name-registry.clar#L62)

## Variables

### last-id-var

uint

```clarity
(define-data-var last-id-var uint u0)
```

[View in file](../contracts/core/name-registry.clar#L37)

### token-uri-var

(string-ascii 256)

```clarity
(define-data-var token-uri-var (string-ascii 256) "")
```

[View in file](../contracts/core/name-registry.clar#L38)

## Constants

### ROLE

```clarity
(define-constant ROLE "registry")
```

[View in file](../contracts/core/name-registry.clar#L26)

### ERR_UNAUTHORIZED

```clarity
(define-constant ERR_UNAUTHORIZED (err u4000))
```

[View in file](../contracts/core/name-registry.clar#L28)

### ERR_ALREADY_REGISTERED

```clarity
(define-constant ERR_ALREADY_REGISTERED (err u4001))
```

[View in file](../contracts/core/name-registry.clar#L29)

### ERR_CANNOT_SET_PRIMARY

```clarity
(define-constant ERR_CANNOT_SET_PRIMARY (err u4002))
```

[View in file](../contracts/core/name-registry.clar#L30)

### ERR_INVALID_ID

```clarity
(define-constant ERR_INVALID_ID (err u4003))
```

[View in file](../contracts/core/name-registry.clar#L31)

### ERR_EXPIRED

```clarity
(define-constant ERR_EXPIRED (err u4004))
```

[View in file](../contracts/core/name-registry.clar#L32)

### ERR_TRANSFER_BLOCKED

```clarity
(define-constant ERR_TRANSFER_BLOCKED (err u4005))
```

[View in file](../contracts/core/name-registry.clar#L33)

### ERR_NOT_OWNER

```clarity
(define-constant ERR_NOT_OWNER (err u4))
```

[View in file](../contracts/core/name-registry.clar#L35)
