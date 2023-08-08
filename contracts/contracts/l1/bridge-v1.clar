;; This contract exposes functions for interacting with the
;; BNS L1<->L2 bridge.

(define-data-var signer-var principal tx-sender)
(define-data-var signer-pubkey-hash-var (buff 20)
  (get-pubkey-hash tx-sender))

;; Errors

(define-constant ERR_INVALID_BLOCK (err u1200))
(define-constant ERR_RECOVER (err u1201))
(define-constant ERR_INVALID_SIGNER (err u1202))
(define-constant ERR_NAME_NOT_MIGRATED (err u1203))

;; Public functions

(define-public (bridge-to-l1
    (name (buff 48))
    (namespace (buff 20))
    (inscription-id (buff 35))
    (signature (buff 65))
  )
  (let
    (
      ;; (block-hash (unwrap! (get-block-info? header-hash height) ERR_INVALID_BLOCK))
      (name-id (unwrap! (contract-call? .bnsx-registry get-id-for-name { name: name, namespace: namespace }) ERR_NAME_NOT_MIGRATED))
    )
    ;; (try! (validate-block-hash height header-hash))
    (try! (validate-wrap-signature name namespace inscription-id signature))
    (try! (contract-call? .l1-registry wrap name-id tx-sender inscription-id))
    (ok true)
  )
)

(define-public (migrate-and-bridge
    (name (buff 48))
    (namespace (buff 20))
    (inscription-id (buff 35))
    (bridge-signature (buff 65))
    (wrapper principal)
    (migrate-signature (buff 65))
  )
  (begin
    (try! (contract-call? .wrapper-migrator-v2 migrate wrapper migrate-signature tx-sender))
    (bridge-to-l1 name namespace inscription-id bridge-signature)
  )
)

;; Signature validation

(define-read-only (validate-wrap-signature
    (name (buff 48))
    (namespace (buff 20))
    (inscription-id (buff 35))
    (signature (buff 65))
  )
  (let
    (
      (hash (hash-wrap-data name namespace inscription-id))
      (pubkey (unwrap! (secp256k1-recover? hash signature) ERR_RECOVER))
      (pubkey-hash (hash160 pubkey))
    )
    (asserts! (is-eq (var-get signer-pubkey-hash-var) pubkey-hash) ERR_INVALID_SIGNER)
    (ok true)
  )
)

(define-read-only (validate-block-hash (height uint) (header-hash (buff 32)))
  (let
    (
      (block-hash (unwrap! (get-block-info? header-hash height) ERR_INVALID_BLOCK))
    )
    (asserts! (is-eq block-hash header-hash) ERR_INVALID_BLOCK)
    (ok true)
  )
)

(define-read-only (hash-for-height (height uint))
  (unwrap-panic (get-block-info? header-hash height))
)

(define-read-only (hash-wrap-data
    (name (buff 48))
    (namespace (buff 20))
    (inscription-id (buff 35))
  )
  (sha256 (unwrap-panic (to-consensus-buff? {
    name: name,
    namespace: namespace,
    inscription-id: inscription-id,
  })))
)

;; Signer management functions

;; #[allow(unchecked_data)]
(define-private (set-signer-inner (signer principal))
  (let
    (
      (pubkey (get-pubkey-hash signer))
    )
    (var-set signer-var signer)
    (var-set signer-pubkey-hash-var pubkey)
    true
  )
)

;; #[allow(unchecked_data)]
(define-private (get-pubkey-hash (addr principal))
  (get hash-bytes (unwrap-panic (principal-destruct? addr)))
)

(define-public (update-signer (signer principal))
  (let
    (
      (current-signer (var-get signer-var))
    )
    ;; #[filter(signer)]
    (asserts! (is-eq current-signer tx-sender) ERR_INVALID_SIGNER)
    (set-signer-inner signer)
    (ok true)
  )
)