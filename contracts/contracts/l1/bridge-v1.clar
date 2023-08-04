;; This contract exposes functions for interacting with the
;; BNS L1<->L2 bridge.

(define-data-var signer-var principal tx-sender)
(define-data-var signer-pubkey-hash-var (buff 20)
  (get-pubkey-hash tx-sender))

;; Errors

(define-constant ERR_INVALID_BLOCK (err u1200))
(define-constant ERR_RECOVER (err u1201))
(define-constant ERR_INVALID_SIGNER (err u1202))

;; Public functions

(define-public (wrap
    (name-id uint)
    (inscription-id (buff 35))
    (height uint)
    (header-hash (buff 32))
    (signature (buff 65))
  )
  (let
    (
      ;; (block-hash (unwrap! (get-block-info? header-hash height) ERR_INVALID_BLOCK))
    )
    (try! (validate-block-hash height header-hash))
    (try! (validate-wrap-signature name-id inscription-id header-hash signature))
    (try! (contract-call? .l1-registry wrap name-id tx-sender inscription-id))
    (ok true)
  )
)

;; Signature validation

(define-read-only (validate-wrap-signature
    (name-id uint)
    (inscription-id (buff 35))
    (header-hash (buff 32))
    (signature (buff 65))
  )
  (let
    (
      (hash (hash-wrap-data name-id inscription-id header-hash))
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
    (name-id uint)
    (inscription-id (buff 35))
    (header-hash (buff 32))
  )
  (sha256 (unwrap-panic (to-consensus-buff? {
    name-id: name-id,
    inscription-id: inscription-id,
    header-hash: header-hash,
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