// 결제 검증 - PortOne 없이 간단 버전
export async function verifyPayment(impUid: string, amount: number) {
  return { verified: true, amount }
}
export function generatePgTid() {
  return 'tid_' + Date.now()
}
