import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { hashPassword, generateTempPassword } from '@/lib/security'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

// 관리자가 누른 계정의 비밀번호를 임시 비밀번호로 바꾸고, 그 값을 한 번만 돌려줍니다.
export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const body = await req.json().catch(() => ({}))
    const userId = typeof body.userId === 'string' ? body.userId : ''
    const loginId = typeof body.loginId === 'string' ? body.loginId : ''
    if (!userId && !loginId) return NextResponse.json({ ok: false, error: '대상 계정 필요' }, { status: 400 })

    const tempPassword = generateTempPassword(12)
    const hashed = await hashPassword(tempPassword)
    const where = userId ? { id: userId } : { loginId }
    const user: any = await (prisma as any).user.update({ where, data: { password: hashed } })

    await logAudit('PASSWORD_RESET', auth.session.loginId, user.id, { by: auth.session.id })
    return NextResponse.json({ ok: true, loginId: user.loginId, tempPassword })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ ok: false, error: '계정을 찾을 수 없습니다' }, { status: 404 })
    return NextResponse.json({ ok: false, error: '초기화 실패' }, { status: 500 })
  }
}
