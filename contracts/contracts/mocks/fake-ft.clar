(define-fungible-token fake-ft)

(define-read-only (get-name) (ok "fake token"))
(define-read-only (get-symbol) (ok "fake"))
(define-read-only (get-decimals) (ok u0))
(define-read-only (get-token-uri) (ok none))

(define-read-only (get-balance (owner principal))
  (ok (ft-get-balance fake-ft owner))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply fake-ft))
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  ;; #[filter(amount, sender, recipient)]
  (ft-transfer? fake-ft amount sender recipient)
)

(define-public (mint (amount uint) (recipient principal))
  ;; #[filter(amount, recipient)]
  (ft-mint? fake-ft amount recipient)
)