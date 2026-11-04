
export function verifyPaymentAmount(requestedAmount: number, validAmounts: number[]){
  // 클라이언트에서 조작된 금액인지 검증
  if(!validAmounts.includes(requestedAmount)){
    throw new Error(`Invalid payment amount: ${requestedAmount}`)
  }
  return true
}

export const VALID_PRICES = [9900, 59900, 149000, 4900, 19900, 2900, 99000]

export function generateIdempotencyKey(userId: string, productId: string){
  return `${userId}-${productId}-${Date.now()}`
}

export function checkDuplicatePayment(idempotencyKey: string, recentKeys: string[]){
  return recentKeys.includes(idempotencyKey)
}
