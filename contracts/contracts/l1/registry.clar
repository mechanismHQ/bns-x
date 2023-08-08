(define-constant ERR_UNAUTHORIZED (err u4000))
(define-constant ERR_TRANSFER (err u1100))
(define-constant ERR_NOT_OWNED_BY_REGISTRY (err u1101))
(define-constant ERR_INVALID_NAME (err u1102))
(define-constant ERR_DUPLICATE_INSCRIPTION (err u1103))

(define-map inscriptions-map uint (buff 35))

(define-data-var extension-var principal .l1-bridge-v1)

(define-private (is-extension)
  (ok (asserts! (is-eq (var-get extension-var) contract-caller) ERR_UNAUTHORIZED))
)

;; Validation of caller
;; Move name into self
;; save inscription ID
(define-public (wrap (name-id uint) (owner principal) (inscription-id (buff 35)))
  (let
    (
      (self (as-contract tx-sender))
    )
    ;; #[filter(inscription-id, name-id)]
    (try! (is-extension))
    ;; (try! (bns-transfer name-id owner self))
    (try! (validate-name-owned-by-registry name-id))
    (asserts! (map-insert inscriptions-map name-id inscription-id) ERR_DUPLICATE_INSCRIPTION)
    (ok true)
  )
)

;; Helpers

;; #[allow(unchecked_data)]
(define-private (bns-transfer (name-id uint) (sender principal) (recipient principal))
  (match (contract-call? .bnsx-registry transfer name-id sender recipient)
    res (ok res)
    e (begin
      (print {
        topic: "transfer-error",
        error: e,
      })
      ERR_TRANSFER
    )
  )
)

;; Getters

(define-read-only (get-inscription-id (name-id uint))
  (map-get? inscriptions-map name-id)
)

;; Validation

(define-read-only (validate-name-owned-by-registry (name-id uint))
  (let
    (
      (self (as-contract tx-sender))
      (owner (unwrap! (contract-call? .bnsx-registry get-name-owner name-id) ERR_INVALID_NAME))
    )
    (asserts! (is-eq self owner) ERR_NOT_OWNED_BY_REGISTRY)
    (ok true)
  )
)