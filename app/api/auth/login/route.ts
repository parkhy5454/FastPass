
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rate-limit'
import { verifyPassword, signJWT, sanitizeInput, validateLoginId } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest){
  const ip = getIP(req)

  // 1. Rate limiting - 5회 실패시 10분 차단
  const limit = checkRateLimit(`login:${ip}`, 5, 10*60*1000, 10*60*1000)
  if(!limit.allowed){
    const minutes = Math.ceil(limit.retryAfter/60000)
    return NextResponse.json({error:`로그인 5회 실패! ${minutes}분 후 재시도하세요`},{status:429, headers:{'Retry-After': String(Math.ceil(limit.retryAfter/1000))}})
  }

  try{
    const body = await req.json()
    let {loginId, password} = body

    // 2. Input validation & sanitization
    loginId = sanitizeInput(loginId)
    const loginIdError = validateLoginId(loginId)
    if(loginIdError){
      return NextResponse.json({error: loginIdError},{status:400})
    }
    if(!password || typeof password !== 'string'){
      return NextResponse.json({error:'비밀번호 필요'},{status:400})
    }
    if(password.length > 100){
      return NextResponse.json({error:'비밀번호가 너무 깁니다'},{status:400})
    }

    // 3. Find user
    const user = await prisma.user.findUnique({where:{loginId}}).catch(()=>null) as any
    if(!user){
      return NextResponse.json({error:'아이디 또는 비밀번호가 틀렸습니다', remaining: limit.remaining},{status:401})
    }

    // 4. Verify password with bcrypt
    const isValid = await verifyPassword(password, user.password)
    if(!isValid){
      return NextResponse.json({error:'아이디 또는 비밀번호가 틀렸습니다', remaining: limit.remaining},{status:401})
    }

    // 5. Check if account is active (optional - add isActive field)
    // if(user.isActive === false) return 403

    // 6. Sign JWT with secure options
    const token = signJWT({
      id: user.id, 
      loginId: user.loginId, 
      role: user.role,
      name: user.name
    })

    // 7. Set httpOnly, Secure, SameSite cookie
    const res = NextResponse.json({
      ok:true,
      user:{
        id: user.id, 
        loginId: user.loginId, 
        name: user.name, 
        role: user.role, 
        points: user.points||0,
        interests: user.interests||[]
      }
    })

    res.cookies.set('token', token, {
      httpOnly: true, // JS에서 접근 불가 - XSS 방어
      secure: process.env.NODE_ENV==='production', // HTTPS에서만
      sameSite: 'strict', // CSRF 방어
      maxAge: 60*60*24*7, // 7일
      path:'/',
    })

    // Security headers
    res.headers.set('X-Content-Type-Options', 'nosniff')

    return res

  }catch(e:any){
    console.error('Login error:', e.message)
    return NextResponse.json({error:'로그인 처리 중 오류'},{status:500})
  }
}
