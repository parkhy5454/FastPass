import { prisma } from './db'
// 결제 2중 검증
export async function verifyPayment(flipbookId: string, paidAmount: number, pgTid: string) {
  const flipbook = await prisma.flipbook.findUnique({ where: { id: flipbookId } })
  if (!flipbook) throw new Error('상품 없음')
  if (flipbook.price !== paidAmount) {
    throw new Error(`가격 위조 감지: 실제 ${flipbook.price} vs 결제 ${paidAmount}`)
  }
  // TODO: 토스페이먼츠 2차 검증
  // const tossRes = await fetch(`https://api.tosspayments.com/v1/payments/${pgTid}`, { headers: { Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY+':').toString('base64')}` } })
  // if (!tossRes.ok) throw new Error('PG 검증 실패')
  return true
}
