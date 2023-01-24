(define-constant NAMESPACE_MANAGER_ROLE "namespaces")

(define-constant ERR_UNAUTHORIZED (err u7000))
(define-constant ERR_NAMESPACE_OWNER_EXISTS (err u7005))
(define-constant ERR_NAMESPACE_UPDATE_UNAUTHORIZED (err u7006))

(define-map namespace-owners-map (buff 20) principal)
(define-map namespace-controllers-map { namespace: (buff 20), controller: principal } bool)

;; Namespace owners

;; If the namespace is owned, only a namespace controller is authorized.
;; Otherwise, the DAO or extensions with "registry" are authorized
(define-private (is-dao-or-controller (namespace (buff 20)))
  (match (map-get? namespace-owners-map namespace)
    owner (ok (asserts! (is-controller namespace contract-caller) ERR_UNAUTHORIZED))
    (ok (asserts! (or (is-eq tx-sender .bnsx-extensions) (contract-call? .bnsx-extensions has-role-or-extension contract-caller NAMESPACE_MANAGER_ROLE)) ERR_UNAUTHORIZED))
  )
)

(define-read-only (is-controller (namespace (buff 20)) (controller principal))
  (default-to false (map-get? namespace-controllers-map { namespace: namespace, controller: controller }))
)

(define-public (set-namespace-owner (namespace (buff 20)) (owner principal))
  (begin
    ;; #[filter(owner)]
    (try! (validate-namespace-update namespace))
    (ok (map-set namespace-owners-map namespace owner))
  )
)

;; If the namespace has a owner, only the owner can update it.
;; Otherwise, only the DAO or an extension with "namespaces" role can update.
(define-private (validate-namespace-update (namespace (buff 20)))
  (match (map-get? namespace-owners-map namespace)
    owner (ok (asserts! (is-eq owner contract-caller) ERR_NAMESPACE_UPDATE_UNAUTHORIZED))
    (ok (asserts! (or (is-eq tx-sender .bnsx-extensions) (contract-call? .bnsx-extensions has-role-or-extension contract-caller NAMESPACE_MANAGER_ROLE)) ERR_UNAUTHORIZED))
  )
)

(define-public (set-namespace-controllers (extension-list (list 200 { controller: principal, namespace: (buff 20), enabled: bool })))
  (ok (map set-controllers-iter extension-list))
)

(define-private (set-controllers-iter (item { controller: principal, namespace: (buff 20), enabled: bool }))
  (begin
    (try! (validate-namespace-update (get namespace item)))
    (print (merge item { event: "set-controllers" }))
    (ok (map-set namespace-controllers-map { namespace: (get namespace item), controller: (get controller item) } (get enabled item)))
  )
)

(define-read-only (get-namespace-owner (namespace (buff 20)))
  (map-get? namespace-owners-map namespace)
)

(define-read-only (is-namespace-controller (namespace (buff 20)) (controller principal))
  (default-to false (map-get? namespace-controllers-map { namespace: namespace, controller: controller }))
)