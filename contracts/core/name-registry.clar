(impl-trait .nft-trait.nft-trait)

;; Variables

(define-constant ROLE "registry")

(define-constant ERR_PANIC (err u0))
(define-constant ERR_UNAUTHORIZED (err u4000))
(define-constant ERR_ALREADY_REGISTERED (err u4001))
(define-constant ERR_CANNOT_SET_PRIMARY (err u4002))
(define-constant ERR_INVALID_ID (err u4003))
(define-constant ERR_EXPIRED (err u4004))
(define-constant ERR_TRANSFER_BLOCKED (err u4005))

(define-constant ERR_NOT_OWNER (err u4))

(define-data-var last-id-var uint u0)
(define-data-var token-uri-var (string-ascii 256) "")

(define-map namespace-managers-map { manager: principal, namespace: (buff 20) } bool)
(define-map dao-namespace-manager-map (buff 20) bool)
(define-map namespace-transfers-allowed (buff 20) bool)

;; Data

(define-non-fungible-token names uint)

;; linked list for account->names
(define-map owner-primary-name-map principal uint)
(define-map owner-last-name-map principal uint)
(define-map owner-name-next-map uint uint)
(define-map owner-name-prev-map uint uint)

(define-map name-owner-map uint principal)

(define-map name-id-map { name: (buff 48), namespace: (buff 20) } uint)
(define-map id-name-map uint { name: (buff 48), namespace: (buff 20) })

(define-map name-encoding-map uint (buff 1))

(define-map owner-balance-map principal uint)

;; Authorization

(define-public (is-dao-or-extension)
  ;; (ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao has-role-or-extension contract-caller ROLE)) ERR_UNAUTHORIZED))
  (ok (asserts! (contract-call? .executor-dao has-role-or-extension contract-caller ROLE) ERR_UNAUTHORIZED))
)

;; Mutators

;; Register a name in the registry
;;
;; If the owner does not have a primary name, this name will be set as their primary
;;
;; @throws if not called by an authorized contract
;;
;; @throws if the name is already registered
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

;; Burn a name. This burns the name NFT and removes all ownership data.
;; 
;; If the name being burnt is the account's primary, and the account
;; owns another name, a different name is automatically set as the account's
;; new primary.
;; 
;; @throws if not called by the owner
(define-public (burn (id uint))
  (match (map-get? name-owner-map id)
    owner (begin
      (asserts! (is-eq tx-sender owner) ERR_NOT_OWNER)
      (burn-name id)
    )
    ERR_NOT_OWNER
  )
)

;; Private method to handle burning a name. See [`burn`](#burn) and
;; [`mng-burn`](#mng-burn)
(define-private (burn-name (id uint))
  (let
    (
      (name (unwrap! (map-get? id-name-map id) ERR_INVALID_ID))
      (owner (unwrap-panic (map-get? name-owner-map id)))
    )
    (remove-node owner id)
    (try! (nft-burn? names id owner))
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

;; Getters

(define-read-only (get-name-properties (name { name: (buff 48), namespace: (buff 20) }))
  (match (map-get? name-id-map name)
    id (merge-name-props name id)
    none
  )
)

(define-read-only (get-name-properties-by-id (id uint))
  (match (map-get? id-name-map id)
    name (merge-name-props name id)
    none
  )
)

;; #[allow(unchecked_data)]
(define-private (merge-name-props (name { name: (buff 48), namespace: (buff 20) }) (id uint))
  (some (merge name { 
    id: id,
    owner: (unwrap-panic (map-get? name-owner-map id))
  }))
)

(define-read-only (get-primary-name (account principal))
  (match (map-get? owner-primary-name-map account)
    id (map-get? id-name-map id)
    none
  )
)

(define-read-only (get-primary-name-properties (account principal))
  (match (map-get? owner-primary-name-map account)
    id (get-name-properties-by-id id)
    none
  )
)

(define-read-only (get-id-for-name (name { name: (buff 48), namespace: (buff 20) }))
  (map-get? name-id-map name)
)

(define-read-only (get-namespace-for-id (id uint))
  (ok (get namespace (unwrap! (map-get? id-name-map id) ERR_INVALID_ID)))
)

(define-read-only (get-name-owner (id uint))
  (map-get? name-owner-map id)
)

;; NFT

;; #[allow(unchecked_data)]
(define-public (dao-set-token-uri (uri (string-ascii 256)))
  (begin
    (try! (is-dao-or-extension))
    (ok (var-set token-uri-var uri))
  )
)

;; Trait methods

(define-read-only (get-last-token-id)
  (let ((last (var-get last-id-var)))
    (ok (if (is-eq last u0) u0 (- last u1)))
  )
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri-var))
)

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? names id))
)

(define-read-only (get-balance (account principal))
  (default-to u0 (map-get? owner-balance-map account))
)
(define-read-only (get-balance-of (account principal)) (ok (get-balance account)))

;; TODO: flag for if namespace can be transfered
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

;; DAO / controller methods

(define-read-only (can-dao-manage-ns (namespace (buff 20)))
  (default-to true (map-get? dao-namespace-manager-map namespace))
)

(define-public (remove-dao-namespace-manager (namespace (buff 20)))
  (begin
    ;; #[filter(namespace)]
    (try! (is-dao-or-extension))
    (map-set dao-namespace-manager-map namespace false)
    (ok true)
  )
)

;; Authorization check for namespace action.
;; 
;; If `contract-caller` is a manager: OK
;; Otherwise:
;;   - Ensure that DAO is allowed to manage namespace
;;   - Check that caller is an authorized extension
(define-read-only (validate-namespace-action (namespace (buff 20)))
  (if (is-namespace-manager namespace contract-caller) (ok true)
    (if (can-dao-manage-ns namespace)
      (is-dao-or-extension)
      ERR_UNAUTHORIZED
    )
  )
)

;; #[filter(id)]
(define-read-only (validate-namespace-action-by-id (id uint))
  (validate-namespace-action (try! (get-namespace-for-id id)))
)

(define-read-only (is-namespace-manager (namespace (buff 20)) (manager principal))
  (default-to false (map-get? namespace-managers-map { namespace: namespace, manager: manager }))
)

(define-public (mng-transfer (id uint) (recipient principal))
  (begin
    ;; #[filter(id, recipient)]
    (try! (validate-namespace-action-by-id id))
    (transfer-ownership id (unwrap-panic (map-get? name-owner-map id)) recipient)
    (ok true)
  )
)

;; Privileged method for burning a name. This allows external contracts to
;; allow transfers based on flexible conditions.
(define-public (mng-burn (id uint))
  (begin
    (try! (validate-namespace-action-by-id id))
    (burn-name id)
  )
)

(define-public (set-namespace-manager (namespace (buff 20)) (manager principal) (enabled bool))
  (begin
    ;; #[filter(namespace, manager)]
    (try! (validate-namespace-action namespace))
    (map-set namespace-managers-map { namespace: namespace, manager: manager } enabled)
    (ok true)
  )
)

(define-public (set-namespace-transfers-allowed (namespace (buff 20)) (enabled bool))
  (begin
    ;; #[filter(namespace)]
    (try! (validate-namespace-action namespace))
    (map-set namespace-transfers-allowed namespace enabled)
    (ok true)
  )
)

(define-read-only (are-transfers-allowed (namespace (buff 20)))
  (default-to true (map-get? namespace-transfers-allowed namespace))
)

;; Helpers

(define-private (increment-id)
  (let
    (
      (last (var-get last-id-var))
    )
    (var-set last-id-var (+ last u1))
    last
  )
)

;; Linked list for keeping track of account
;; primary names

;; Helper to traverse names
(define-read-only (get-next-node-id (id uint))
  (map-get? owner-name-next-map id)
)

;; #[allow(unchecked_data)]
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