(impl-trait .proposal-trait.proposal-trait)

(define-constant DEPLOYER tx-sender)

(define-public (execute (sender principal))
  (begin
    ;; Enable genesis extensions
    ;; (try! (contract-call? .executor-dao set-extensions
    ;;   (list
    ;;   )
    ;; ))
    ;; WORKAROUND PRE-2.1
    ;; NOT IN PROD
    (try! (add-test-utils))
    ;; (and (not is-in-mainnet) (try! (add-test-utils)))

    (try! (contract-call? .executor-dao set-extension-roles
      (list
        { extension: .wrapper-migrator, enabled: true, role: "registry" }
      )
    ))

    (ok true)
  )
)

(define-private (add-test-utils)
  (begin
    ;; workaround for https://github.com/stacks-network/stacks-blockchain/pull/3440

    (try! (contract-call? .executor-dao set-extensions 
      (list 
        { extension: DEPLOYER, enabled: true }
        { extension: .test-utils, enabled: true }
      )
    ))
    (ok true)
  )
)
