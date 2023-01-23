;; ONLY FOR USE IN TESTS

(define-constant deployer tx-sender)

(define-constant ERR_UNAUTHORIZED (err u12000))

(define-private (is-deployer)
  (begin
    (asserts! (is-eq tx-sender deployer) ERR_UNAUTHORIZED)
    ;; (asserts! (not is-in-mainnet) ERR_UNAUTHORIZED)
    (ok true)
  )

)

(define-public (name-register 
    (name (buff 48)) 
    (namespace (buff 20))
    (owner principal)
  )
  (begin
    (try! (is-deployer))
    (contract-call? .bnsx-registry register
      {
        name: name,
        namespace: namespace,
      }
      owner
    )
  )
)

(define-public (v1-register (name (buff 48)) (namespace (buff 20)))
  (let
    (
      ;; (transfer-ok (try! (stx-transfer? u100000 (as-contract tx-sender) tx-sender)))
      (salt 0x00)
      (hashed (hash160 (concat (concat (concat name 0x2e) namespace) salt)))
    )
    (try! (contract-call? 'ST000000000000000000002AMW42H.bns name-preorder hashed u100000))

    (try! (contract-call? 'ST000000000000000000002AMW42H.bns name-register namespace name salt 0x00))
    (ok true)
  )
)

(define-public (v1-register-transfer (name (buff 48)) (namespace (buff 20)) (recipient principal))
  (begin
    (try! (v1-register name namespace))
    (try! (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer namespace name recipient none))
    (match (stx-transfer? u1000000 tx-sender recipient)
      r (ok true)
      e (err (to-int e))
    )
  )
)
