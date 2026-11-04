import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { hasAccess } from '@/lib/subscription'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) return NextResponse.json({ allowed: false, reason: '로그인 필요' })
  try {
    const { feature, count, requested } = await req.json()
    let plan = 'FREE'
    const user: any = await (prisma as any).user.findUnique({ where: { id: session.id } }).catch(() => null)
    if (user) {
      plan = user.plan || user.subscription || 'FREE'
      if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) plan = 'FREE'
    }
    const result = hasAccess(plan, feature, Number(count) || 0, requested)
    return NextResponse.json({ ...result, plan })
  } catch {
    // 확인에 실패하면 허용하지 않습니다 (기존에는 허용하던 부분)
    return NextResponse.json({ allowed: false, reason: '권한 확인 실패' }, { status: 500 })
  }
}
