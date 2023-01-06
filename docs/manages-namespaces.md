# manages-namespaces

[`managed-namespaces.clar`](../contracts/core/managed-namespaces.clar)

**Public functions:**

- [`set-namespace-owner`](#set-namespace-owner)
- [`set-namespace-controllers`](#set-namespace-controllers)

**Read-only functions:**

- [`is-controller`](#is-controller)
- [`get-namespace-owner`](#get-namespace-owner)
- [`is-namespace-controller`](#is-namespace-controller)

**Private functions:**

- [`is-dao-or-controller`](#is-dao-or-controller)
- [`validate-namespace-update`](#validate-namespace-update)
- [`set-controllers-iter`](#set-controllers-iter)

## Functions

### is-dao-or-controller

[View in file](../contracts/core/managed-namespaces.clar#L14)

`(define-private (is-dao-or-controller ((namespace (buff 20))) (response bool uint))`

If the namespace is owned, only a namespace controller is authorized. Otherwise,
the DAO or extensions with "registry" are authorized

<details>
  <summary>Source code:</summary>

```clarity
(define-private (is-dao-or-controller (namespace (buff 20)))
  (match (map-get? namespace-owners-map namespace)
    owner (ok (asserts! (is-controller namespace contract-caller) ERR_UNAUTHORIZED))
    (ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao has-role-or-extension contract-caller NAMESPACE_MANAGER_ROLE)) ERR_UNAUTHORIZED))
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### is-controller

[View in file](../contracts/core/managed-namespaces.clar#L21)

`(define-read-only (is-controller ((namespace (buff 20)) (controller principal)) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-controller (namespace (buff 20)) (controller principal))
  (default-to false (map-get? namespace-controllers-map { namespace: namespace, controller: controller }))
)
```

</details>

**Parameters:**

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| namespace  | (buff 20) |             |
| controller | principal |             |

### set-namespace-owner

[View in file](../contracts/core/managed-namespaces.clar#L25)

`(define-public (set-namespace-owner ((namespace (buff 20)) (owner principal)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-namespace-owner (namespace (buff 20)) (owner principal))
  (begin
    ;; #[filter(owner)]
    (try! (validate-namespace-update namespace))
    (ok (map-set namespace-owners-map namespace owner))
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |
| owner     | principal |             |

### validate-namespace-update

[View in file](../contracts/core/managed-namespaces.clar#L35)

`(define-private (validate-namespace-update ((namespace (buff 20))) (response bool uint))`

If the namespace has a owner, only the owner can update it. Otherwise, only the
DAO or an extension with "namespaces" role can update.

<details>
  <summary>Source code:</summary>

```clarity
(define-private (validate-namespace-update (namespace (buff 20)))
  (match (map-get? namespace-owners-map namespace)
    owner (ok (asserts! (is-eq owner contract-caller) ERR_NAMESPACE_UPDATE_UNAUTHORIZED))
    (ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao has-role-or-extension contract-caller NAMESPACE_MANAGER_ROLE)) ERR_UNAUTHORIZED))
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### set-namespace-controllers

[View in file](../contracts/core/managed-namespaces.clar#L42)

`(define-public (set-namespace-controllers ((extension-list (list 200 (tuple (controller principal) (enabled bool) (namespace (buff 20)))))) (response (list 200 (response bool uint)) none))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-namespace-controllers (extension-list (list 200 { controller: principal, namespace: (buff 20), enabled: bool })))
  (ok (map set-controllers-iter extension-list))
)
```

</details>

**Parameters:**

| Name           | Type                                                                           | Description |
| -------------- | ------------------------------------------------------------------------------ | ----------- |
| extension-list | (list 200 (tuple (controller principal) (enabled bool) (namespace (buff 20)))) |             |

### set-controllers-iter

[View in file](../contracts/core/managed-namespaces.clar#L46)

`(define-private (set-controllers-iter ((item (tuple (controller principal) (enabled bool) (namespace (buff 20))))) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (set-controllers-iter (item { controller: principal, namespace: (buff 20), enabled: bool }))
  (begin
    (try! (validate-namespace-update (get namespace item)))
    (print (merge item { event: "set-controllers" }))
    (ok (map-set namespace-controllers-map { namespace: (get namespace item), controller: (get controller item) } (get enabled item)))
  )
)
```

</details>

**Parameters:**

| Name | Type                                                                | Description |
| ---- | ------------------------------------------------------------------- | ----------- |
| item | (tuple (controller principal) (enabled bool) (namespace (buff 20))) |             |

### get-namespace-owner

[View in file](../contracts/core/managed-namespaces.clar#L54)

`(define-read-only (get-namespace-owner ((namespace (buff 20))) (optional principal))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (get-namespace-owner (namespace (buff 20)))
  (map-get? namespace-owners-map namespace)
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| namespace | (buff 20) |             |

### is-namespace-controller

[View in file](../contracts/core/managed-namespaces.clar#L58)

`(define-read-only (is-namespace-controller ((namespace (buff 20)) (controller principal)) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-namespace-controller (namespace (buff 20)) (controller principal))
  (default-to false (map-get? namespace-controllers-map { namespace: namespace, controller: controller }))
)
```

</details>

**Parameters:**

| Name       | Type      | Description |
| ---------- | --------- | ----------- |
| namespace  | (buff 20) |             |
| controller | principal |             |
