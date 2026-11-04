import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma } from '@/lib/db'
import { sanitizeInput } from '@/lib/security'

// 본인 정보만 수정할 수 있습니다. 역할/포인트/플랜은 여기서 바꿀 수 없습니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const body = await req.json().catch(() => ({}))
  const data: Record<string, any> = {}

  if (body.name !== undefined) {
    const name = sanitizeInput(body.name)
    if (name.length < 2 || name.length > 50) return NextResponse.json({ error: '이름은 2~50자' }, { status: 400 })
    data.name = name
  }
  if (body.phone !== undefined) {
    const phone = sanitizeInput(body.phone).replace(/-/g, '')
    if (phone && !/^\d{10,11}$/.test(phone)) return NextResponse.json({ error: '전화번호 형식 오류' }, { status: 400 })
    data.phone = phone || null
  }
  if (body.interests !== undefined) {
    if (!Array.isArray(body.interests) || body.interests.length > 10) {
      return NextResponse.json({ error: '관심 자격증 형식 오류' }, { status: 400 })
    }
    data.interests = body.interests.filter((x: any) => typeof x === 'string').map((x: string) => sanitizeInput(x))
  }

  try {
    const user = await (prisma as any).user.update({ where: { id: auth.session.id }, data })
    return NextResponse.json({ ok: true, user: { id: user.id, loginId: user.loginId, name: user.name } })
  } catch {
    return NextResponse.json({ error: '수정 실패' }, { status: 500 })
  }
}
