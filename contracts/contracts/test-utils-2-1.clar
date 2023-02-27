(define-read-only (get-pubkey-hash (account principal))
  (get hash-bytes (unwrap-panic (principal-destruct? account)))
)