import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const p: any = prisma
    const totalUsers = await p.user.count()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayJoins = await p.user.count({ where: { createdAt: { gte: today } } })
    let totalRevenue = 0
    try {
      const agg: any = await p.purchase.aggregate({ _sum: { amount: true }, where: { verified: true } })
      totalRevenue = agg._sum?.amount || 0
    } catch {}
    return NextResponse.json({ totalUsers, todayJoins, totalRevenue })
  } catch (e: any) {
    return NextResponse.json({ totalUsers: 0, todayJoins: 0, totalRevenue: 0, error: '조회 실패' }, { status: 500 })
  }
}
