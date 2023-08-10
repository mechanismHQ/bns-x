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
      (name-details (try! (validate-name-owned-by-registry name-id)))
    )
    ;; #[filter(inscription-id, name-id)]
    (try! (is-extension))
    (asserts! (map-insert inscriptions-map name-id inscription-id) ERR_DUPLICATE_INSCRIPTION)
    (ok name-details)
  )
)

(define-public (unwrap (name-id uint) (recipient principal))
  (let
    (
      (inscription-id (unwrap! (map-get? inscriptions-map name-id) ERR_INVALID_NAME))
      (name-details (try! (get-name-properties name-id)))
    )
    ;; #[filter(name-id, recipient)]
    (try! (is-extension))
    (map-delete inscriptions-map name-id)
    (try! (as-contract (bns-transfer name-id tx-sender recipient)))
    (ok name-details)
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
      (name-details (try! (get-name-properties name-id)))
    )
    (asserts! (is-eq self (get owner name-details)) ERR_NOT_OWNED_BY_REGISTRY)
    (ok true)
  )
)

(define-read-only (get-name-properties (name-id uint))
  (ok (unwrap! (contract-call? .bnsx-registry get-name-properties-by-id name-id) ERR_INVALID_NAME)))