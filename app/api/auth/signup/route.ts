import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rate-limit'
import { hashPassword, sanitizeInput, validateLoginId, validatePassword } from '@/lib/security'
import { prisma } from '@/lib/db'

// 가입으로 만들 수 없는 예약 아이디 (관리자/데모 계정 사칭 방지)
const RESERVED_IDS = ['admin', 'demo', 'root', 'system', 'support']

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const limit = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000, 60 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json({ error: '회원가입 시도 너무 많음. 1시간 후 재시도' }, { status: 429 })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })

    const loginId = sanitizeInput(body.loginId)
    const password = typeof body.password === 'string' ? body.password : ''
    const name = sanitizeInput(body.name)
    const phone = sanitizeInput(body.phone || '')
    const interests = Array.isArray(body.interests) ? body.interests.filter((x: any) => typeof x === 'string').slice(0, 10) : []
    let referredBy: string | null = body.referredBy ? sanitizeInput(body.referredBy) : null

    const loginIdError = validateLoginId(loginId)
    if (!loginIdError.valid) return NextResponse.json({ error: loginIdError.error }, { status: 400 })
    if (RESERVED_IDS.includes(loginId.toLowerCase())) {
      return NextResponse.json({ error: '사용할 수 없는 아이디입니다' }, { status: 400 })
    }

    const pwError = validatePassword(password)
    if (!pwError.valid) return NextResponse.json({ error: pwError.error }, { status: 400 })

    if (!name || name.length < 2) return NextResponse.json({ error: '이름은 2자 이상' }, { status: 400 })
    if (name.length > 50) return NextResponse.json({ error: '이름이 너무 깁니다' }, { status: 400 })

    if (phone && !/^\d{10,11}$/.test(phone.replace(/-/g, ''))) {
      return NextResponse.json({ error: '올바른 전화번호 형식이 아닙니다' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { loginId } }).catch(() => null)
    if (existing) return NextResponse.json({ error: '이미 존재하는 아이디입니다' }, { status: 409 })

    if (referredBy) {
      const referrer = await prisma.user.findUnique({ where: { loginId: referredBy } }).catch(() => null)
      if (!referrer) referredBy = null
    }

    const hashedPassword = await hashPassword(password)

    // 가입자는 항상 일반 사용자. 관리자 권한은 DB에서 직접 부여합니다.
    const newUser = await prisma.user.create({
      data: {
        loginId,
        password: hashedPassword,
        name,
        phone: phone || null,
        interests,
        role: 'USER',
        points: 0,
        referredBy,
      },
    })

    if (referredBy) {
      await prisma.user.update({
        where: { loginId: referredBy },
        data: { points: { increment: 1000 }, pointsUpdatedAt: new Date() },
      }).catch((e: unknown) => console.error('Referral bonus failed:', e))
    }

    return NextResponse.json({ ok: true, user: { id: newUser.id, loginId: newUser.loginId, name: newUser.name } })
  } catch (e: any) {
    console.error('Signup error:', e?.message)
    if (e?.code === 'P2002') return NextResponse.json({ error: '이미 존재하는 아이디' }, { status: 409 })
    return NextResponse.json({ error: '회원가입 처리 중 오류' }, { status: 500 })
  }
}
