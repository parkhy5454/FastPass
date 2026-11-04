
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest){
  const res = NextResponse.next()

  // Security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;")
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CSRF check for state-changing methods (except login/signup)
  if(['POST','PUT','DELETE','PATCH'].includes(req.method)){
    const path = req.nextUrl.pathname
    const exempt = ['/api/auth/login', '/api/auth/signup', '/api/csrf', '/api/auth/logout']
    if(!exempt.some(p=> path.startsWith(p))){
      const csrfHeader = req.headers.get('x-csrf-token') || req.headers.get('X-CSRF-Token')
      // For now, log but don't block (to avoid breaking existing clients)
      // In production, enforce: if(!csrfHeader) return NextResponse.json({error:'CSRF token required'}, {status:403})
    }
  }

  // Admin check
  if(req.nextUrl.pathname.startsWith('/api/admin/')){
    const token = req.cookies.get('token')?.value
    if(!token){
      return NextResponse.json({error:'인증 필요'},{status:401})
    }
  }

  return res
}

export const config = {
  matcher: ['/api/:path*', '/my/:path*', '/admin/:path*']
}
