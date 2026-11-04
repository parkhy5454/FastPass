import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 관리자 API 중 공개로 열어 둘 GET 경로 (플립북 열람 화면이 사용)
const PUBLIC_ADMIN_GET = ['/api/admin/flipbooks', '/api/admin/categories', '/api/admin/problem-types']

async function getRole(token: string | undefined): Promise<string | null> {
  const secret = process.env.JWT_SECRET
  if (!token || !secret || secret.length < 32) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] })
    return typeof payload.role === 'string' ? payload.role : null
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const res = NextResponse.next()

  // 보안 헤더
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  const scriptEval = process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"
  res.headers.set('Content-Security-Policy',
    `default-src 'self' 'unsafe-inline'${scriptEval} https: data: blob:;`)

  const token = req.cookies.get('token')?.value
  const isPublicAdminGet = req.method === 'GET' && PUBLIC_ADMIN_GET.includes(path)

  // 관리자 API: 토큰 서명 + ADMIN 역할 확인
  if (path.startsWith('/api/admin/') && !isPublicAdminGet) {
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 })
    }
    const role = await getRole(token)
    if (!role) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
    if (role !== 'ADMIN') return NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 })
  }

  // 관리자 화면: 관리자가 아니면 로그인 화면으로
  if (path.startsWith('/admin')) {
    const role = await getRole(token)
    if (role !== 'ADMIN') {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
}
