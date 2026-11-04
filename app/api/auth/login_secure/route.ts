
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { checkRateLimit, getIP } from '@/lib/rate-limit'
import { verifyPassword, signJWT } from '@/lib/security'
const prisma = new PrismaClient()
export async function POST(req: NextRequest){
  try{
    const ip = getIP(req)
    const limit = checkRateLimit(ip, 5, 10*60*1000)
    if(!limit.allowed){
      return NextResponse.json({error: `로그인 5회 실패! ${Math.ceil((limit.retryAfter||0)/60000)}분 후 재시도`},{status:429})
    }
    const {loginId, password} = await req.json()
    if(!loginId || !password) return NextResponse.json({error:'아이디/비밀번호 필요'},{status:400})
    const user = await prisma.user.findUnique({where:{loginId}}).catch(()=>null) as any
    if(!user) return NextResponse.json({error:'아이디 또는 비밀번호 틀림'},{status:401})
    const isValid = await verifyPassword(password, user.password)
    if(!isValid) return NextResponse.json({error:'아이디 또는 비밀번호 틀림', remaining: limit.remaining},{status:401})
    const token = signJWT({id: user.id, loginId: user.loginId, role: user.role})
    const res = NextResponse.json({user:{id:user.id, loginId:user.loginId, name:user.name, role:user.role, points:user.points}})
    res.cookies.set('token', token, {httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'strict', maxAge: 60*60*24*7, path:'/'})
    return res
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
