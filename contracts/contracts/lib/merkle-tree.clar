(define-read-only (process-proof 
    (proof (list 10 (buff 20)))
    (root (buff 20))
    (leaf (buff 20))
  )
  (is-eq (fold hash-pair proof leaf) root)
)

(define-read-only (hash-pair (a (buff 20)) (b (buff 20)))
  (hash160 (if (< a b) (concat a b) (concat b a)))
)