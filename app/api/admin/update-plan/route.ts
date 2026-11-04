import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

const PLAN_MONTHS: Record<string, number> = { MONTHLY: 1, YEARLY: 12 }
const PLAN_YEARS_LIFETIME = 100

// 관리자 전용 수동 플랜 변경. 결제 확인은 /api/payments/verify 에서 처리합니다.
export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const { plan, userId } = await req.json().catch(() => ({}))
    if (!userId || typeof userId !== 'string') return NextResponse.json({ error: 'userId 필요' }, { status: 400 })
    if (!['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'].includes(plan)) {
      return NextResponse.json({ error: '잘못된 플랜' }, { status: 400 })
    }

    const expiresAt = new Date()
    if (plan === 'LIFETIME') expiresAt.setFullYear(expiresAt.getFullYear() + PLAN_YEARS_LIFETIME)
    else if (PLAN_MONTHS[plan]) expiresAt.setMonth(expiresAt.getMonth() + PLAN_MONTHS[plan])
    else expiresAt.setTime(0)

    await (prisma as any).user.update({
      where: { id: userId },
      data: { plan, subscription: plan, subscriptionExpiresAt: expiresAt },
    })
    await logAudit('PAYMENT', auth.session.loginId, userId, { plan, manual: true })
    return NextResponse.json({ ok: true, plan, expiresAt })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: '계정을 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json({ error: '플랜 변경 실패' }, { status: 500 })
  }
}
