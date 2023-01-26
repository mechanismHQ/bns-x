(impl-trait .proposal-trait.proposal-trait)

(define-constant DEPLOYER tx-sender)

(define-public (execute (sender principal))
  (begin
    ;; Enable genesis extensions
    (try! (contract-call? .bnsx-extensions set-extensions
      (list
        { extension: DEPLOYER, enabled: false }
        { extension: .test-utils, enabled: false }
        { extension: .fake-multisafe, enabled: true }
      )
    ))

    (ok true)
  )
)