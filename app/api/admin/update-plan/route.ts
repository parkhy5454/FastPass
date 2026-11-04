
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})

    const {plan, userId} = await req.json()
    const targetId = userId || payload.id

    const expiresAt = new Date()
    if(plan==='MONTHLY') expiresAt.setMonth(expiresAt.getMonth()+1)
    else if(plan==='YEARLY') expiresAt.setFullYear(expiresAt.getFullYear()+1)
    else if(plan==='LIFETIME') expiresAt.setFullYear(expiresAt.getFullYear()+100)

    try{
      await prisma.user.update({
        where:{id: targetId},
        data:{
          plan,
          subscription: plan,
          subscriptionExpiresAt: expiresAt,
          points: {decrement: 0} // Keep points
        } as any
      })
    }catch(e:any){
      console.log('Plan update fallback:', e.message)
    }

    return NextResponse.json({ok:true, plan, expiresAt})

  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
