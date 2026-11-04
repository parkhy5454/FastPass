
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getIP } from '@/lib/rate-limit'
import { hashPassword, sanitizeInput, validateLoginId, validatePassword } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest){
  const ip = getIP(req)

  // Rate limiting - 회원가입은 1시간에 5개까지
  const limit = checkRateLimit(`signup:${ip}`, 5, 60*60*1000, 60*60*1000)
  if(!limit.allowed){
    return NextResponse.json({error:'회원가입 시도 너무 많음. 1시간 후 재시도'},{status:429})
  }

  try{
    const body = await req.json()
    let {loginId, password, name, phone, interests, referredBy} = body

    // Sanitization
    loginId = sanitizeInput(loginId)
    name = sanitizeInput(name)
    phone = sanitizeInput(phone||'')
    if(referredBy) referredBy = sanitizeInput(referredBy)

    // Validation
    const loginIdError = validateLoginId(loginId)
    if(loginIdError) return NextResponse.json({error: loginIdError},{status:400})

    const pwError = validatePassword(password)
    if(pwError) return NextResponse.json({error: pwError},{status:400})

    if(!name || name.length < 2) return NextResponse.json({error:'이름은 2자 이상'},{status:400})
    if(name.length > 50) return NextResponse.json({error:'이름이 너무 깁니다'},{status:400})

    if(phone){
      // Phone validation - remove hyphens and check
      const phoneNum = phone.replace(/-/g, '')
      if(!/^\d{10,11}$/.test(phoneNum)){
        return NextResponse.json({error:'올바른 전화번호 형식이 아닙니다'},{status:400})
      }
    }

    if(interests && !Array.isArray(interests)){
      return NextResponse.json({error:'관심 자격증 형식 오류'},{status:400})
    }
    if(interests && interests.length > 10){
      return NextResponse.json({error:'관심 자격증은 10개 이하'},{status:400})
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({where:{loginId}}).catch(()=>null)
    if(existing){
      return NextResponse.json({error:'이미 존재하는 아이디입니다'},{status:409})
    }

    // Validate referredBy exists
    if(referredBy){
      const referrer = await prisma.user.findUnique({where:{loginId: referredBy}}).catch(()=>null)
      if(!referrer){
        referredBy = null // Invalid referral code - ignore
      }
    }

    // Hash password with cost 12
    const hashedPassword = await hashPassword(password)

    // Determine role - only parkhy5454 is admin
    const isAdminUser = loginId.toLowerCase().includes('parkhy5454') || loginId.toLowerCase() === 'admin'

    // Create user
    const newUser = await prisma.user.create({
      data:{
        loginId,
        password: hashedPassword,
        name,
        phone: phone||null,
        interests: interests||[],
        role: isAdminUser ? 'ADMIN' : 'USER',
        points: 0,
        referredBy: referredBy||null,
      } as any
    })

    // Referral bonus - 1000P
    if(referredBy){
      try{
        await prisma.user.update({
          where:{loginId: referredBy},
          data:{ points: {increment:1000} } as any
        })
      }catch(e){
        console.log('Referral bonus failed:', e)
      }
    }

    return NextResponse.json({ok:true, user:{id:newUser.id, loginId:newUser.loginId, name:newUser.name}})

  }catch(e:any){
    console.error('Signup error:', e.message)
    if(e.code === 'P2002'){
      return NextResponse.json({error:'이미 존재하는 아이디'},{status:409})
    }
    return NextResponse.json({error:'회원가입 처리 중 오류'},{status:500})
  }
}
