;; A contract for a generic linked-list structure
;; 
;; Each linked list is account-specific:
;; 
;; owner -V
;;        1-2-3-4

(define-map account-first-map principal uint)
(define-map account-last-map principal uint)

(define-map node-next-map uint uint)
(define-map node-prev-map uint uint)

(define-data-var next-id-var uint u0)

(define-public (add-node (account principal))
  (let
    (
      (id (var-get next-id-var))
      (last-opt (map-get? account-last-map account))
    )
    ;; #[filter(account)]
    (var-set next-id-var (+ id u1))
    ;; Set "first" if it doesnt exist
    (map-insert account-first-map account id)
    (map-set account-last-map account id)
    (match last-opt
      last (begin
        (map-set node-next-map last id)
        (map-set node-prev-map id last)
      )
      true
    )
    (ok id)
  )
)

(define-public (remove-node (account principal) (id uint))
  (let
    (
      (prev-opt (get-prev id))
      (next-opt (get-next id))
      (first (unwrap-panic (get-first account)))
      (last (unwrap-panic (get-last account)))
    )
    ;; We're removing the first
    (and (is-eq first id)
      (if (is-some next-opt)
        (map-set account-first-map account (unwrap-panic next-opt))
        (map-delete account-first-map account)
      )
      ;; (map-delete account-first-map account)
    )
    ;; removing the last
    (and (is-eq last id)
      (if (is-some prev-opt)
        (map-set account-last-map account (unwrap-panic prev-opt))
        ;; Removing the _only_ node:
        (map-delete account-last-map account)
      )
    )
    (match next-opt
      next (if (is-some prev-opt)
        (map-set node-prev-map next (unwrap-panic prev-opt))
        (map-delete node-prev-map next)
      )
      true
    )
    (match prev-opt
      prev (if (is-some next-opt)
        (map-set node-next-map prev (unwrap-panic next-opt))
        (map-delete node-next-map prev)
      )
      true
    )
    (map-delete node-next-map id)
    (map-delete node-prev-map id)
    
    (ok true)
  )
)

(define-public (set-first (account principal) (node uint))
  (let
    (
      (first (unwrap! (get-first account) (err u1)))
    )
    ;; make sure this isn't the existing first
    (asserts! (not (is-eq first node)) (err u1))
    (unwrap-panic (remove-node account node))
    (map-set account-first-map account node)
    (map-set node-prev-map first node)
    (map-set node-next-map node first)
    (ok true)
  )
)

;; getters

(define-read-only (get-first (account principal))
  (map-get? account-first-map account)
)

(define-read-only (get-last (account principal))
  (map-get? account-last-map account)
)

(define-read-only (get-prev (id uint))
  (map-get? node-prev-map id)
)

(define-read-only (get-next (id uint))
  (map-get? node-next-map id)
)

