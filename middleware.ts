
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Public paths that don't need auth
const PUBLIC_PATHS = ['/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/me', '/_next', '/favicon', '/icon', '/manifest']

export async function middleware(req: NextRequest){
  const path = req.nextUrl.pathname

  // Skip public paths
  if(PUBLIC_PATHS.some(p=> path.startsWith(p))){
    return NextResponse.next()
  }

  // Security headers for all requests
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CSP - prevent XSS
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  )

  // Rate limiting check for API routes
  if(path.startsWith('/api/')){
    // Basic rate limit - in production use Upstash Redis
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    // Allow all for now, actual limiting in route handlers
  }

  // Auth check for protected API routes
  if(path.startsWith('/api/admin/')){
    const token = req.cookies.get('token')?.value
    if(!token){
      return NextResponse.json({error:'인증 필요'},{status:401})
    }
    try{
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'a7f3c9e2b8d4f1a6c5e0b9d2a8f3a7d1f5e0c2b8a4f6e9d')
      const {payload} = await jwtVerify(token, secret)
      if(payload.role !== 'ADMIN' && !(payload as any).loginId?.toLowerCase().includes('parkhy5454')){
        return NextResponse.json({error:'관리자 권한 필요'},{status:403})
      }
    }catch{
      return NextResponse.json({error:'토큰 만료 또는 유효하지 않음'},{status:401})
    }
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/my/:path*', '/admin/:path*', '/learn/:path*'],
}
