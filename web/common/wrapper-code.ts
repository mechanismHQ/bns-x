
  export const nameWrapperCode = `(define-constant ERR_NO_NAME (err u10000))
(define-constant ERR_NAME_TRANSFER (err u10001))
(define-constant ERR_UNAUTHORIZED (err u10002))
(define-constant ERR_NOT_WRAPPED (err u10003))

(define-public (unwrap (recipient (optional principal)))
  (let
    (
      (props (try! (get-name-info)))
      (new-owner (default-to tx-sender recipient))
      (owner (get owner props))
    )
    (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
    (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry burn (get id props)))
    (unwrap! (as-contract (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer (get namespace props) (get name props) new-owner none)) ERR_NAME_TRANSFER)
    (ok props)
  )
)

(define-read-only (get-own-name)
  (ok (unwrap! (contract-call? 'ST000000000000000000002AMW42H.bns resolve-principal (as-contract tx-sender)) ERR_NO_NAME))
)

(define-read-only (get-name-info)
  (let
    (
      (name (try! (get-own-name)))
      (props (unwrap! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registry get-name-properties name) ERR_NOT_WRAPPED))
    )
    (ok props)
  )
)

(define-read-only (get-owner)
  (ok (get owner (try! (get-name-info))))
)

(define-public (name-update (zonefile-hash (buff 20)))
  (let
    (
      (props (try! (get-name-info)))
    )
    (asserts! (is-eq tx-sender (get owner props)) ERR_UNAUTHORIZED)
    (match (as-contract (contract-call? 'ST000000000000000000002AMW42H.bns name-update (get namespace props) (get name props) zonefile-hash))
      r (ok true)
      e (err (to-uint e))
    )
  )
)
`;
  