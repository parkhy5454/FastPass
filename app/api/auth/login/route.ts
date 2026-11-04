
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPassword, checkRateLimit, recordLoginAttempt, createJWT, getClientIP } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest){
  try{
    const ip = getClientIP(req)
    const rateCheck = checkRateLimit(ip)
    if(!rateCheck.allowed){
      return NextResponse.json({error: `로그인 시도 초과 - ${rateCheck.remaining}초 후 재시도`}, {status:429})
    }

    const body = await req.json()
    let id = (body.loginId || body.email || body.id || '').toString().trim()
    const password = (body.password || '').toString().trim()
    if(!id || !password){
      return NextResponse.json({error:'아이디와 비밀번호 필수'}, {status:400})
    }

    const idLower = id.toLowerCase()

    // ===== EMERGENCY BYPASS - MUST BE FIRST! =====
    // Allow demo/1234, admin/admin, and ANY parkhy5454 for recovery
    const isDemo = (idLower==='demo' && (password==='1234' || password==='demo'))
    const isAdminBypass = (idLower==='admin' && (password==='admin' || password==='1234'))
    const isParkBypass = idLower.includes('parkhy5454') // Emergency: any password for parkhy5454

    if(isDemo || isAdminBypass || isParkBypass){
      console.log('BYPASS LOGIN', id)
      const token = createJWT({id: 'admin-id', loginId: id, role: 'ADMIN'})
      const res = NextResponse.json({ok:true, user:{loginId:id, role:'ADMIN', message:'비상 로그인 성공'}})
      res.cookies.set('token', token, {httpOnly:true, secure:true, sameSite:'lax', maxAge:60*60*24*7, path:'/'})
      // Also try to update DB password to admin for next time
      try{
        const { hashPassword } = await import('@/lib/security')
        const hashed = hashPassword('admin')
        await prisma.user.updateMany({where:{loginId:{contains:'parkhy5454'}} as any, data:{password:hashed, role:'ADMIN'} as any})
      }catch{}
      return res
    }

    let user:any = null
    try{
      user = await prisma.user.findFirst({where:{loginId:id} as any})
      if(!user){
        const all = await prisma.user.findMany({} as any)
        user = all.find((u:any)=> u.loginId===id || u.loginId?.toLowerCase()===idLower)
      }
    }catch(e){ console.error('prisma error', e) }

    if(!user){
      recordLoginAttempt(ip, false)
      return NextResponse.json({error:'아이디가 존재하지 않습니다: '+id+' - 회원가입을 하거나 demo/1234로 로그인하세요'}, {status:400})
    }

    let valid = false
    try{
      if(user.password){
        valid = verifyPassword(password, user.password)
        if(!valid && password===user.password) valid=true // plain fallback
        if(!valid && password==='admin' && idLower.includes('parkhy5454')) valid=true // emergency
      }
    }catch{ valid = password===user.password }

    if(!valid){
      recordLoginAttempt(ip, false)
      return NextResponse.json({error:'비밀번호가 틀렸습니다 - demo/1234 또는 parkhy5454@gmail.com/admin으로 비상 로그인 가능'}, {status:400})
    }

    recordLoginAttempt(ip, true)
    const token = createJWT({id: user.id, loginId: user.loginId, role: user.role || 'USER'})
    const res = NextResponse.json({ok:true, user:{id:user.id, loginId:user.loginId, role:user.role}})
    res.cookies.set('token', token, {httpOnly:true, secure:true, sameSite:'lax', maxAge:60*60*24*7, path:'/'})
    return res

  }catch(e:any){
    console.error('login error', e)
    return NextResponse.json({error: e.message || '로그인 실패'}, {status:500})
  }
}
