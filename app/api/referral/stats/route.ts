import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { maskName } from '@/lib/masking'

const EMPTY = { count: 0, points: 0, paidCount: 0, referredUsers: [], leaderboard: [] }

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json(EMPTY)
  try {
    const p: any = prisma
    const me = await p.user.findUnique({ where: { id: session.id } }).catch(() => null)
    if (!me) return NextResponse.json(EMPTY)

    const referred: any[] = await p.user.findMany({ where: { referredBy: me.loginId }, select: { id: true, name: true, loginId: true, createdAt: true } }).catch(() => [])
    const paid: any[] = await p.purchase.findMany({ where: { userId: { in: referred.map((r) => r.id) }, verified: true }, select: { userId: true } }).catch(() => [])
    const paidSet = new Set(paid.map((x) => x.userId))

    // 리더보드: 아이디는 숨기고 이름만 가리기 처리해서 보여 줍니다
    const allUsers: any[] = await p.user.findMany({ where: { referredBy: { not: null } }, select: { loginId: true, name: true, referredBy: true } }).catch(() => [])
    const countMap: Record<string, number> = {}
    const nameOf: Record<string, string> = {}
    allUsers.forEach((u) => { countMap[u.referredBy] = (countMap[u.referredBy] || 0) + 1 })
    const referrerIds = Object.keys(countMap)
    const referrers: any[] = referrerIds.length
      ? await p.user.findMany({ where: { loginId: { in: referrerIds } }, select: { loginId: true, name: true } }).catch(() => [])
      : []
    referrers.forEach((u) => { nameOf[u.loginId] = u.name })
    const leaderboard = Object.entries(countMap)
      .map(([loginId, count]) => ({ name: maskName(nameOf[loginId] || '회원'), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      count: referred.length,
      paidCount: paidSet.size,
      points: me.points ?? 0,
      referredUsers: referred.map((r) => ({ id: r.id, name: r.name, createdAt: r.createdAt, hasPaid: paidSet.has(r.id) })).reverse(),
      leaderboard,
    })
  } catch {
    return NextResponse.json(EMPTY)
  }
}
