(define-constant DEPLOYER tx-sender)

(define-public (init-namespace
  (namespace (buff 20))
  (salt (buff 20))
)
  (let
    (
      (preorder-ok (try! (namespace-preorder namespace salt)))
      (reveal-ok (try! (namespace-reveal namespace salt)))
      (ready-ok (try! (contract-call? 'ST000000000000000000002AMW42H.bns namespace-ready namespace)))
    )
    (ok namespace)
  )
)

(define-private (namespace-reveal (namespace (buff 20)) (salt (buff 20)))
  (contract-call? 'ST000000000000000000002AMW42H.bns namespace-reveal
    namespace
    salt
    u1000
    u10
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u1
    u0
    DEPLOYER
  )
)

(define-private (namespace-preorder (namespace (buff 20)) (salt (buff 20)))
  (let
    (
      (hashed (hash160 (concat namespace salt)))
    )
    (contract-call? 'ST000000000000000000002AMW42H.bns namespace-preorder hashed u640000000)
  )
)

(try! (init-namespace 0x7465737461626c65 0x00))