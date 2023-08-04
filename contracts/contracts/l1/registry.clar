(define-constant ERR_UNAUTHORIZED (err u4000))
(define-constant ERR_TRANSFER (err u1100))

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
    (try! (bns-transfer name-id owner self))
    (map-set inscriptions-map name-id inscription-id)
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