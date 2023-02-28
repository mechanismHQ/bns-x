;; A fake bns-x contract for integrators to test with

(define-map fake-names uint {
  owner: principal,
  name: (buff 48),
  namespace: (buff 20),
})

(define-map fake-names-by-name { name: (buff 48), namespace: (buff 20) } {
  id: uint,
  owner: principal,
})

(define-public (test-register-name (id uint) (owner principal) (name (buff 48)) (namespace (buff 20)))
  (begin
    (map-set fake-names id {
      owner: owner,
      name: name,
      namespace: namespace
    })
    (ok true)
  )
)

;; This mimicks the "real" functions:

(define-read-only (get-name-properties (name { name: (buff 48), namespace: (buff 20) }))
  (match (map-get? fake-names-by-name name)
    props (some (merge props name))
    none
  )
)

(define-read-only (get-name-properties-by-id (id uint))
  (match (map-get? fake-names id)
    props (some (merge props { id: id }))
    none
  )
)

;; Primary names:

(define-map primary-names principal {
  name: (buff 48),
  namespace: (buff 20)
})

(define-public (set-primary-name (owner principal) (name { (buff 48), namespace: (buff 20) }))
  (begin
    (map-set primary-names owner name)
    (ok true)
  )
)

(define-read-only (get-primary-name (account principal))
  (map-get? primary-names account)
)