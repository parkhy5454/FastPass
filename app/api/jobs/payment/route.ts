import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { mockPaymentsEnabled, PAYMENT_DISABLED_MESSAGE } from '@/lib/payment-gate'

const JOB_PRICES: Record<string, number> = {
  '1건': 50000,
  '5건': 200000,
  '무제한': 300000,
}

export async function POST(req: NextRequest) {
  if (!mockPaymentsEnabled()) {
    return NextResponse.json({ error: PAYMENT_DISABLED_MESSAGE }, { status: 503 })
  }
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const { packageType } = await req.json().catch(() => ({}))
  const price = JOB_PRICES[packageType]
  if (!price) return NextResponse.json({ error: '잘못된 상품' }, { status: 400 })
  return NextResponse.json({
    ok: true,
    verified: true,
    packageType,
    amount: price,
    paymentId: `job_${Date.now()}`,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })
}
