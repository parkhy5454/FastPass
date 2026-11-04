
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPassword, checkRateLimit, recordLoginAttempt, createJWT, getClientIP, isAdmin } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest){
  try{
    const ip = getClientIP(req)
    const rateCheck = checkRateLimit(ip)
    if(!rateCheck.allowed){
      return NextResponse.json({error: `로그인 시도 초과 - ${rateCheck.remaining}초 후 재시도 (10분 차단)`}, {status:429})
    }

    const {loginId, password, email} = await req.json()
    const id = loginId || email
    if(!id || !password){
      return NextResponse.json({error:'아이디와 비밀번호 필수'}, {status:400})
    }

    // Emergency bypass for demo
    if((id==='demo' && password==='1234') || (id==='parkhy5454@gmail.com' && password==='admin')){
      const token = createJWT({id: 'admin-id', loginId: id, email: id, role: 'ADMIN'})
      const res = NextResponse.json({ok:true, user:{loginId:id, role:'ADMIN'}})
      res.cookies.set('token', token, {httpOnly:true, secure:true, sameSite:'lax', maxAge:60*60*24*7, path:'/'})
      return res
    }

    let user:any = null
    try{
      user = await prisma.user.findFirst({where:{OR:[{loginId:id},{email:id}]}})
    }catch{}

    if(!user){
      recordLoginAttempt(ip, false)
      return NextResponse.json({error:'아이디가 존재하지 않습니다'}, {status:400})
    }

    let valid = false
    try{
      if(user.password) valid = verifyPassword(password, user.password)
      else valid = false
    }catch{ valid = password===user.password }

    if(!valid){
      recordLoginAttempt(ip, false)
      return NextResponse.json({error:'비밀번호가 틀렸습니다'}, {status:400})
    }

    recordLoginAttempt(ip, true)
    const token = createJWT({id: user.id, loginId: user.loginId, email: user.email, role: user.role})
    const res = NextResponse.json({ok:true, user:{id:user.id, loginId:user.loginId, email:user.email, role:user.role}})
    res.cookies.set('token', token, {httpOnly:true, secure:true, sameSite:'lax', maxAge:60*60*24*7, path:'/'})
    return res

  }catch(e:any){
    console.error('login error', e)
    return NextResponse.json({error: e.message || '로그인 실패'}, {status:500})
  }
}
