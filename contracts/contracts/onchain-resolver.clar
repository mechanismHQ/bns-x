(define-constant ERR_UNAUTHORIZED (err u8000))

(define-map zonefiles-map uint (buff 2048))

(define-public (emit-zonefile (zonefile (buff 102400)))
  (begin
    (print zonefile)
    (ok true)
  ) 
)

(define-public (set-zonefile (id uint) (zonefile (buff 2048)))
  (let
    (
      (owner (contract-call? .bnsx-registry get-name-owner id))
    )
    ;; #[filter(zonefile)]
    (asserts! (is-eq (some tx-sender) owner) ERR_UNAUTHORIZED)
    (print {
      topic: "set-zonefile-onchain",
      zonefile: zonefile,
      id: id,
    })
    (map-set zonefiles-map id zonefile)
    (ok true)
  )
)

(define-read-only (resolve-zonefile (id uint))
  (map-get? zonefiles-map id)
)

(define-read-only (resolve-zonefile-for-name (name (buff 48)) (namespace (buff 20)))
  (match (contract-call? .bnsx-registry get-id-for-name { name: name, namespace: namespace })
    id (resolve-zonefile id)
    none
  )
)
