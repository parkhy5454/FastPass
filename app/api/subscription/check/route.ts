
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { hasAccess } from '@/lib/subscription'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({allowed:false, reason:'로그인 필요'})

    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({allowed:false, reason:'인증 만료'})

    const {feature, count, requested} = await req.json()

    // Get user plan
    let plan = 'FREE'
    try{
      const user = await prisma.user.findUnique({where:{id: payload.id}}).catch(()=>null)
      if(user){
        plan = user.plan || user.subscription || 'FREE'
        // Check expiry
        if(user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()){
          plan = 'FREE'
        }
      }
    }catch{}

    const result = hasAccess(plan, feature, count||0, requested)
    return NextResponse.json({...result, plan})

  }catch(e:any){
    return NextResponse.json({allowed:true}) // Fail open for now
  }
}
