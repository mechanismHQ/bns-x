(impl-trait .nft-trait.nft-trait)

(define-non-fungible-token fake-nft uint)

(define-data-var last-token-id-var uint u0)

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id-var))
)

(define-read-only (get-token-uri (id uint))
  (ok none)
)

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? fake-nft id))
)

(define-public (transfer (id uint) (sender principal) (recipient principal))
  ;; #[filter(sender, recipient)]
  (if (is-eq tx-sender (unwrap! (nft-get-owner? fake-nft id) (err u10)))
    (nft-transfer? fake-nft id sender recipient)
    (err u0)
  )
)

(define-public (mint (owner principal))
  (let
    (
      (last-id (var-get last-token-id-var))
      (next-id (+ last-id u1))
    )
    (var-set last-token-id-var next-id)
    ;; #[filter(owner)]
    (unwrap-panic (nft-mint? fake-nft next-id owner))
    (ok next-id)
  )
)