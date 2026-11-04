import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rate-limit'
import { signJWT, verifyPassword, isLegacyHash, hashPassword } from '@/lib/security'
import { prisma } from '@/lib/db'

const GENERIC_ERROR = '아이디 또는 비밀번호가 올바르지 않습니다'

function setTokenCookie(res: NextResponse, token: string) {
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
}

function publicUser(u: { id: string; loginId: string; name: string | null; role: string; email?: string | null; interests?: string[] | null }) {
  return {
    id: u.id,
    loginId: u.loginId,
    name: u.name || u.loginId,
    role: u.role || 'USER',
    email: u.email || u.loginId,
    interests: u.interests && u.interests.length ? u.interests : ['전기'],
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req)
    const limit = checkRateLimit(`login:${ip}`, 5, 10 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json({ error: '로그인 시도가 너무 많습니다. 10분 후 다시 시도하세요' }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    const loginId = typeof body?.loginId === 'string' ? body.loginId.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!loginId || !password) {
      return NextResponse.json({ error: '아이디와 비밀번호를 입력하세요' }, { status: 400 })
    }

    // 데모 계정: 환경변수로 켠 경우에만 동작하며 일반 사용자 권한입니다.
    if (process.env.ENABLE_DEMO_ACCOUNT === 'true' && process.env.DEMO_PASSWORD &&
        loginId === 'demo' && password === process.env.DEMO_PASSWORD) {
      const user = { id: 'demo-id', loginId: 'demo', name: '데모', role: 'USER', email: 'demo@fastpass.com', interests: ['전기'] }
      const res = NextResponse.json({ ok: true, user: publicUser(user) })
      setTokenCookie(res, signJWT(user))
      return res
    }

    const dbUser: any = await prisma.user.findFirst({
      where: { OR: [{ loginId }, { email: loginId }] },
    })
    if (!dbUser || !(await verifyPassword(password, dbUser.password))) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
    }

    // 예전 해시는 로그인 성공 시 bcrypt 로 교체
    if (isLegacyHash(dbUser.password)) {
      const newHash = await hashPassword(password)
      await prisma.user.update({ where: { id: dbUser.id }, data: { password: newHash } }).catch(() => {})
    }

    const user = publicUser(dbUser)
    const res = NextResponse.json({ ok: true, user })
    setTokenCookie(res, signJWT(user))
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: '로그인 처리 중 오류가 발생했습니다' }, { status: 500 })
  }
}
