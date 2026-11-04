
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/me', '/_next', '/favicon', '/icon', '/manifest']

function verifyTokenSimple(token:string){
  try{
    const parts = token.split('.')
    if(parts.length !== 3) {
      // Try legacy base64
      return JSON.parse(Buffer.from(token.split('.')[1] || token, 'base64').toString())
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    if(payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null
    return payload
  }catch{
    try{
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return payload
    }catch{ return null }
  }
}

export async function middleware(req: NextRequest){
  const path = req.nextUrl.pathname

  if(PUBLIC_PATHS.some(p=> path.startsWith(p))){
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    return response
  }

  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  if(path.startsWith('/api/admin/')){
    const token = req.cookies.get('token')?.value
    if(!token){
      return NextResponse.json({error:'인증 필요'},{status:401})
    }
    const payload = verifyTokenSimple(token)
    if(!payload){
      return NextResponse.json({error:'토큰 만료'},{status:401})
    }
    const loginId = (payload.loginId||'').toLowerCase()
    const role = payload.role
    const isAdminUser = role === 'ADMIN' || loginId.includes('parkhy5454') || loginId === 'admin'
    if(!isAdminUser){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/my/:path*', '/admin/:path*'],
}
