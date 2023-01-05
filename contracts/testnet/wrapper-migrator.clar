(define-constant ROLE "mig-signer")

(define-constant ERR_NO_NAME (err u6000))
(define-constant ERR_UNAUTHORIZED (err u6001))
(define-constant ERR_RECOVER (err u6002))
(define-constant ERR_INVALID_CONTRACT_NAME (err u6003))
(define-constant ERR_NAME_TRANSFER (err u6004))
(define-constant ERR_WRAPPER_USED (err u6005))

(define-map migrator-signers-map (buff 20) bool)

(define-map name-wrapper-map uint principal)
(define-map wrapper-name-map principal uint)

(define-data-var wrapped-id-var uint u0)
(define-data-var wrapper-deployer (buff 20) (get hash-bytes (unwrap-panic (principal-destruct? tx-sender))))

(define-constant network-addr-version (if is-in-mainnet 0x16 0x1a))

;; CONSTRUCTOR

(set-signers-iter { signer: tx-sender, enabled: true })

;; DAO operations

(define-public (is-dao-or-extension)
  ;; (ok (asserts! (or (is-eq tx-sender .executor-dao) (contract-call? .executor-dao has-role-or-extension contract-caller ROLE)) ERR_UNAUTHORIZED))
  (ok (asserts! (contract-call? .executor-dao has-role-or-extension contract-caller ROLE) ERR_UNAUTHORIZED))
)

;; #[allow(unchecked_data)]
(define-private (set-signers-iter (item { signer: principal, enabled: bool }))
  (let
    (
      (pubkey (get hash-bytes (unwrap-panic (principal-destruct? (get signer item)))))
    )
    (print pubkey)
    (map-set migrator-signers-map pubkey (get enabled item))
    pubkey
  )
)

(define-public (set-signers (signers (list 50 { signer: principal, enabled: bool })))
  (begin
    (try! (is-dao-or-extension))
    (ok (map set-signers-iter signers))
  )
)

;; Migration

(define-public (migrate (wrapper principal) (signature (buff 65)) (recipient principal))
  (let
    (
      ;; #[filter(wrapper)]
      (wrapper-ok (try! (verify-wrapper wrapper signature)))
      (properties (try! (resolve-and-transfer wrapper)))
      (name (get name properties))
      (namespace (get namespace properties))
      (id (try! (contract-call? .name-registry register
        {
          name: name,
          namespace: namespace,
        }
        recipient
      )))
      (meta (merge { id: id } properties))
    )
    (print {
      topic: "migrate",
      wrapper: wrapper,
      id: id,
    })
    (asserts! (map-insert name-wrapper-map id wrapper) ERR_WRAPPER_USED)
    (asserts! (map-insert wrapper-name-map wrapper id) ERR_WRAPPER_USED)

    (ok meta)
  )
)


;; Signature validation

;; #[filter(wrapper)]
(define-read-only (verify-wrapper (wrapper principal) (signature (buff 65)))
  (let
    (
      (msg (sha256 (unwrap-panic (to-consensus-buff? wrapper))))
      (pubkey (unwrap! (secp256k1-recover? msg signature) ERR_RECOVER))
      ;; (addr (unwrap-panic (principal-of? pubkey)))
      ;; (pubkey-hash (get hash-bytes (unwrap-panic (principal-destruct? addr))))
      (pubkey-hash (hash160 pubkey))
    )
    ;; (ok pubkey-hash)
    (asserts! (default-to false (map-get? migrator-signers-map pubkey-hash)) ERR_UNAUTHORIZED)
    (ok true)
  )
)

(define-read-only (debug-signature (wrapper principal) (signature (buff 65)))
  (let
    (
      (pubkey-hash (try! (recover-pubkey-hash wrapper signature)))
    )
    (ok {
      pubkey-hash: pubkey-hash,
      valid-signer: (default-to false (map-get? migrator-signers-map pubkey-hash)),
      signer: (unwrap-panic (principal-construct? network-addr-version pubkey-hash))
    })
  )
)

(define-read-only (recover-pubkey-hash (wrapper principal) (signature (buff 65)))
  (let
    (
      (msg (sha256 (unwrap-panic (to-consensus-buff? wrapper))))
      (pubkey (unwrap! (secp256k1-recover? msg signature) ERR_RECOVER))
    )
    (ok (hash160 pubkey))
  )
)

(define-read-only (is-valid-signer (signer principal))
  (let
    (
      (pubkey (get hash-bytes (unwrap-panic (principal-destruct? signer))))
    )
    (default-to false (map-get? migrator-signers-map pubkey))
  )
)

(define-read-only (hash-principal (wrapper principal))
  (sha256 (unwrap-panic (to-consensus-buff? wrapper)))
)

(define-read-only (construct (hash-bytes (buff 20)))
  (principal-construct? network-addr-version hash-bytes)
)

;; Transfer to a new contract

(define-read-only (get-legacy-name (account principal))
  (match (contract-call? 'ST000000000000000000002AMW42H.bns resolve-principal account)
    name (let
      (
        (properties (unwrap-panic (contract-call? 'ST000000000000000000002AMW42H.bns name-resolve (get namespace name) (get name name))))
      )
      (ok (merge name properties))
    )
    e ERR_NO_NAME
  )
)

;; #[allow(unchecked_data)]
(define-private (resolve-and-transfer (wrapper principal))
  (let
    (
      (name (try! (get-legacy-name tx-sender)))
    )
    (match (contract-call? 'ST000000000000000000002AMW42H.bns name-transfer (get namespace name) (get name name) wrapper none)
      success (begin
        (print (merge name {
          topic: "v1-name-transfer",
          wrapper: wrapper,
        }))
        (ok name)
      )
      err-code (begin
        (print {
          topic: "name-transfer-error",
          bns-error: err-code,
          sender: tx-sender,
          name: name,
        })
        ERR_NAME_TRANSFER
      )
    )
  )
)

;; Getters

(define-read-only (get-wrapper-name (wrapper principal)) (map-get? wrapper-name-map wrapper))

(define-read-only (get-name-wrapper (name uint)) (map-get? name-wrapper-map name))
