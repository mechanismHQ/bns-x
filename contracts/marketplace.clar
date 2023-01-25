(use-trait commission-trait .commission-trait.commission)

(define-map market uint {price: uint, commission: principal})

(define-constant ERR_UNAUTHORIZED (err u9000))
(define-constant ERR_NOT_TRANSFERABLE (err u9001))
(define-constant ERR_NOT_FOUND (err u9002))
(define-constant ERR_INVALID_LISTING (err u9003))
(define-constant ERR_INVALID_COMMISSION (err u9004))

(define-private (is-sender-owner (id uint))
  (let
    (
      (owner (unwrap! (contract-call? .bnsx-registry get-name-owner id) ERR_UNAUTHORIZED))
    )
    (ok (asserts! (is-eq owner tx-sender) ERR_UNAUTHORIZED))
  )
)

(define-read-only (get-listing-in-ustx (id uint))
  (map-get? market id))

(define-public (list-in-ustx (id uint) (price uint) (comm <commission-trait>))
  (let 
    (
      (listing  {price: price, commission: (contract-of comm)})
    )
    (try! (is-sender-owner id))
    ;; (asserts! (is-sender-owner id) ERR_UNAUTHORIZED)
    (map-set market id listing)
    (print (merge listing {a: "list-in-ustx", id: id}))
    (ok true)
  )
)

(define-public (unlist-in-ustx (id uint))
  (begin
    (try! (is-sender-owner id))
    (map-delete market id)
    (print {a: "unlist-in-ustx", id: id})
    (ok true)
  )
)

(define-public (buy-in-ustx (id uint) (comm <commission-trait>))
  (let 
    (
      (owner (unwrap! (contract-call? .bnsx-registry get-name-owner id) ERR_NOT_FOUND))
      (listing (unwrap! (map-get? market id) ERR_INVALID_LISTING))
      (price (get price listing))
    )
    (asserts! (is-eq (contract-of comm) (get commission listing)) ERR_INVALID_COMMISSION)
    (try! (stx-transfer? price tx-sender owner))
    (try! (contract-call? comm pay id price))
    (try! (contract-call? .bnsx-registry mng-transfer id tx-sender))
    (map-delete market id)
    (print {a: "buy-in-ustx", id: id})
    (ok true)
  )
)