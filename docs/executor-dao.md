# executor-dao

[`executor-dao.clar`](../contracts/executor-dao.clar)

ExecutorDAO is the one DAO to rule them all. By Marvin Janssen

**Public functions:**

- [`set-extension`](#set-extension)
- [`set-extensions`](#set-extensions)
- [`set-extension-roles`](#set-extension-roles)
- [`execute`](#execute)
- [`construct`](#construct)
- [`request-extension-callback`](#request-extension-callback)

**Read-only functions:**

- [`is-extension`](#is-extension)
- [`has-role`](#has-role)
- [`has-role-or-extension`](#has-role-or-extension)
- [`executed-at`](#executed-at)

**Private functions:**

- [`is-self-or-extension`](#is-self-or-extension)
- [`set-extensions-iter`](#set-extensions-iter)
- [`set-roles-iter`](#set-roles-iter)

## Functions

### is-self-or-extension

[View in file](../contracts/executor-dao.clar#L19)

`(define-private (is-self-or-extension () (response bool uint))`

#[allow(unchecked_params)]

<details>
  <summary>Source code:</summary>

```clarity
(define-private (is-self-or-extension)
  (ok (asserts! (or (is-eq tx-sender (as-contract tx-sender)) (is-extension contract-caller)) err-unauthorised))
)
```

</details>

### is-extension

[View in file](../contracts/executor-dao.clar#L26)

`(define-read-only (is-extension ((extension principal)) bool)`

#[allow(unchecked_params)]

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (is-extension (extension principal))
  (default-to false (map-get? extensions extension))
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| extension | principal |             |

### has-role

[View in file](../contracts/executor-dao.clar#L30)

`(define-read-only (has-role ((extension principal) (role (string-ascii 10))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (has-role (extension principal) (role (string-ascii 10)))
  (default-to false (map-get? extension-roles { extension: extension, role: role }))
)
```

</details>

**Parameters:**

| Name      | Type              | Description |
| --------- | ----------------- | ----------- |
| extension | principal         |             |
| role      | (string-ascii 10) |             |

### has-role-or-extension

[View in file](../contracts/executor-dao.clar#L34)

`(define-read-only (has-role-or-extension ((extension principal) (role (string-ascii 10))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (has-role-or-extension (extension principal) (role (string-ascii 10)))
  (or (is-extension extension) (has-role extension role) (is-eq extension (as-contract tx-sender)))
)
```

</details>

**Parameters:**

| Name      | Type              | Description |
| --------- | ----------------- | ----------- |
| extension | principal         |             |
| role      | (string-ascii 10) |             |

### set-extension

[View in file](../contracts/executor-dao.clar#L38)

`(define-public (set-extension ((extension principal) (enabled bool)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-extension (extension principal) (enabled bool))
  (begin
    (try! (is-self-or-extension))
    (asserts! (is-eq tx-sender (as-contract tx-sender)) (err u4))
    (print {event: "extension", extension: extension, enabled: enabled})
    (ok (map-set extensions extension enabled))
  )
)
```

</details>

**Parameters:**

| Name      | Type      | Description |
| --------- | --------- | ----------- |
| extension | principal |             |
| enabled   | bool      |             |

### set-extensions-iter

[View in file](../contracts/executor-dao.clar#L47)

`(define-private (set-extensions-iter ((item (tuple (enabled bool) (extension principal)))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (set-extensions-iter (item {extension: principal, enabled: bool}))
  (begin
    (print {event: "extension", extension: (get extension item), enabled: (get enabled item)})
    ;; #[allow(unchecked_data)]
    (map-set extensions (get extension item) (get enabled item))
  )
)
```

</details>

**Parameters:**

| Name | Type                                         | Description |
| ---- | -------------------------------------------- | ----------- |
| item | (tuple (enabled bool) (extension principal)) |             |

### set-extensions

[View in file](../contracts/executor-dao.clar#L55)

`(define-public (set-extensions ((extension-list (list 200 (tuple (enabled bool) (extension principal))))) (response (list 200 bool) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-extensions (extension-list (list 200 {extension: principal, enabled: bool})))
  (begin
    (try! (is-self-or-extension))
    (ok (map set-extensions-iter extension-list))
  )
)
```

</details>

**Parameters:**

| Name           | Type                                                    | Description |
| -------------- | ------------------------------------------------------- | ----------- |
| extension-list | (list 200 (tuple (enabled bool) (extension principal))) |             |

### set-roles-iter

[View in file](../contracts/executor-dao.clar#L62)

`(define-private (set-roles-iter ((item (tuple (enabled bool) (extension principal) (role (string-ascii 10))))) bool)`

<details>
  <summary>Source code:</summary>

```clarity
(define-private (set-roles-iter (item { extension: principal, role: (string-ascii 10), enabled: bool }))
  (begin
    (print (merge item { event: "role" }))
    ;; #[allow(unchecked_data)]
    (map-set extension-roles { extension: (get extension item), role: (get role item) } (get enabled item))
  )
)
```

</details>

**Parameters:**

| Name | Type                                                                  | Description |
| ---- | --------------------------------------------------------------------- | ----------- |
| item | (tuple (enabled bool) (extension principal) (role (string-ascii 10))) |             |

### set-extension-roles

[View in file](../contracts/executor-dao.clar#L70)

`(define-public (set-extension-roles ((extension-list (list 200 (tuple (enabled bool) (extension principal) (role (string-ascii 10)))))) (response (list 200 bool) uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (set-extension-roles (extension-list (list 200 { extension: principal, role: (string-ascii 10), enabled: bool })))
  (begin
    (try! (is-self-or-extension))
    (ok (map set-roles-iter extension-list))
  )
)
```

</details>

**Parameters:**

| Name           | Type                                                                             | Description |
| -------------- | -------------------------------------------------------------------------------- | ----------- |
| extension-list | (list 200 (tuple (enabled bool) (extension principal) (role (string-ascii 10)))) |             |

### executed-at

[View in file](../contracts/executor-dao.clar#L79)

`(define-read-only (executed-at ((proposal trait_reference)) (optional uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-read-only (executed-at (proposal <proposal-trait>))
  (map-get? executed-proposals (contract-of proposal))
)
```

</details>

**Parameters:**

| Name     | Type            | Description |
| -------- | --------------- | ----------- |
| proposal | trait_reference |             |

### execute

[View in file](../contracts/executor-dao.clar#L83)

`(define-public (execute ((proposal trait_reference) (sender principal)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (execute (proposal <proposal-trait>) (sender principal))
  (begin
    (try! (is-self-or-extension))
    (asserts! (map-insert executed-proposals (contract-of proposal) block-height) err-already-executed)
    (print {event: "execute", proposal: proposal})
    (as-contract (contract-call? proposal execute sender))
  )
)
```

</details>

**Parameters:**

| Name     | Type            | Description |
| -------- | --------------- | ----------- |
| proposal | trait_reference |             |
| sender   | principal       |             |

### construct

[View in file](../contracts/executor-dao.clar#L94)

`(define-public (construct ((proposal trait_reference)) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (construct (proposal <proposal-trait>))
  (let ((sender tx-sender))
    (asserts! (is-eq sender (var-get executive)) err-unauthorised)
    (var-set executive (as-contract tx-sender))
    (as-contract (execute proposal sender))
  )
)
```

</details>

**Parameters:**

| Name     | Type            | Description |
| -------- | --------------- | ----------- |
| proposal | trait_reference |             |

### request-extension-callback

[View in file](../contracts/executor-dao.clar#L104)

`(define-public (request-extension-callback ((extension trait_reference) (memo (buff 34))) (response bool uint))`

<details>
  <summary>Source code:</summary>

```clarity
(define-public (request-extension-callback (extension <extension-trait>) (memo (buff 34)))
  (let ((sender tx-sender))
    (asserts! (is-extension contract-caller) err-invalid-extension)
    (asserts! (is-eq contract-caller (contract-of extension)) err-invalid-extension)
    (as-contract (contract-call? extension callback sender memo))
  )
)
```

</details>

**Parameters:**

| Name      | Type            | Description |
| --------- | --------------- | ----------- |
| extension | trait_reference |             |
| memo      | (buff 34)       |             |
