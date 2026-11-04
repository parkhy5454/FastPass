import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword, validatePassword } from '@/lib/security'
import { checkRateLimit } from '@/lib/rate-limit'

// 로그인한 본인의 비밀번호 변경. 현재 비밀번호를 확인한 뒤에만 바꿉니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const userId: string = auth.session.id

  // 현재 비밀번호 무작위 대입 방지: 10분에 5회
  const limit = checkRateLimit(`pwchange:${userId}`, 5, 10 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json({ error: '시도 횟수를 초과했습니다. 10분 후 다시 시도하세요' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: '현재 비밀번호와 새 비밀번호를 입력하세요' }, { status: 400 })
  }
  const check = validatePassword(newPassword)
  if (!check.valid) return NextResponse.json({ error: check.error }, { status: 400 })
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: '새 비밀번호는 현재 비밀번호와 달라야 합니다' }, { status: 400 })
  }

  try {
    const db: any = prisma
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: '비밀번호를 변경할 수 없는 계정입니다' }, { status: 404 })
    if (!(await verifyPassword(currentPassword, user.password))) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다' }, { status: 401 })
    }
    const hashed = await hashPassword(newPassword)
    await db.user.update({ where: { id: userId }, data: { password: hashed } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('password change error', e)
    return NextResponse.json({ error: '비밀번호 변경 실패' }, { status: 500 })
  }
}
