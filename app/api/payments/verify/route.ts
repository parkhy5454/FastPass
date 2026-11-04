import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { PLANS, PRODUCTS } from '@/lib/subscription'
import { mockPaymentsEnabled, PAYMENT_DISABLED_MESSAGE } from '@/lib/payment-gate'
import { rewardReferrerOnce } from '@/lib/referral'
import { prisma } from '@/lib/db'

// 금액은 클라이언트 값을 믿지 않고 서버 가격표로 계산합니다.
// productId 에는 구독 플랜 id(MONTHLY 등) 또는 상품 id(AI_REPORT 등)가 옵니다.
function lookup(productId?: string): { price: number; plan?: string } | null {
  if (!productId) return null
  if ((PRODUCTS as any)[productId]) return { price: (PRODUCTS as any)[productId].price }
  if ((PLANS as any)[productId]) return { price: (PLANS as any)[productId].price, plan: productId }
  return null
}

export async function POST(req: NextRequest) {
  // PG 검증 연동 전에는 결제를 처리하지 않습니다 (ALLOW_MOCK_PAYMENTS=true 인 테스트 환경만 예외)
  if (!mockPaymentsEnabled()) {
    return NextResponse.json({ error: PAYMENT_DISABLED_MESSAGE }, { status: 503 })
  }
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const userId: string = auth.session.id

  try {
    const { amount, productId, idempotencyKey } = await req.json().catch(() => ({}))
    const item = lookup(productId)
    if (!item) return NextResponse.json({ error: '알 수 없는 상품' }, { status: 400 })
    const price = item.price
    const plan = item.plan
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) {
      return NextResponse.json({ error: 'idempotencyKey 필요' }, { status: 400 })
    }

    const p: any = prisma
    const dup = await p.purchase.findFirst({ where: { pgTid: idempotencyKey } })
    if (dup) return NextResponse.json({ error: '이미 처리된 결제입니다' }, { status: 409 })

    // 클라이언트가 보낸 금액이 있으면 서버 가격과 같아야 합니다 (포인트 차감 후 금액은 별도 확인 대상)
    if (amount !== undefined && Number(amount) > price) {
      return NextResponse.json({ error: '결제 금액이 상품 가격보다 큽니다' }, { status: 400 })
    }

    await p.purchase.create({
      data: { userId, amount: price, pgTid: idempotencyKey, verified: true, flipbookId: productId || null },
    })

    if (plan && plan !== 'FREE') {
      const expiresAt = new Date()
      if (plan === 'LIFETIME') expiresAt.setFullYear(expiresAt.getFullYear() + 100)
      else if (plan === 'YEARLY') expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      else expiresAt.setMonth(expiresAt.getMonth() + 1)
      await p.user.update({ where: { id: userId }, data: { plan, subscription: plan, subscriptionExpiresAt: expiresAt } })
    }

    await rewardReferrerOnce(userId)
    return NextResponse.json({ ok: true, verified: true, amount: price, productId: productId || null, plan: plan || null })
  } catch (e: any) {
    console.error('payment verify error', e?.message)
    return NextResponse.json({ error: '결제 처리 실패' }, { status: 500 })
  }
}
