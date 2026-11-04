import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    // 비밀번호 해시는 절대 내보내지 않습니다
    const users: any[] = await (prisma as any).user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, loginId: true, name: true, email: true, phone: true, role: true, plan: true, points: true, createdAt: true },
    })
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayUsers = users.filter((u) => u.createdAt && new Date(u.createdAt) >= today).length
    return NextResponse.json({ users, stats: { totalUsers: users.length, todayUsers, total: users.length } })
  } catch (e: any) {
    console.error('users API', e?.message)
    return NextResponse.json({ users: [], stats: { totalUsers: 0, todayUsers: 0 }, error: '조회 실패' }, { status: 500 })
  }
}
