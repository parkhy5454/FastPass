
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, isAdmin } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function GET(){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload.loginId, payload.role)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }

    const users = await prisma.user.findMany({
      orderBy:{createdAt:'desc'},
      select:{
        id:true,
        loginId:true,
        name:true,
        phone:true,
        role:true,
        interests:true,
        points:true,
        referredBy:true,
        createdAt:true,
      } as any
    }).catch(()=>[])

    return NextResponse.json(users)
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
