
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma as db } from '@/lib/db'
const prisma = db as any

export async function POST(req: NextRequest){
  try{
    const payload = getSession()
    if(!payload) return NextResponse.json({error:'로그인 필요'},{status:401})
    const {usePoints, totalPrice} = await req.json()
    if(typeof usePoints !== 'number' || typeof totalPrice !== 'number' || usePoints < 0 || totalPrice < 0){
      return NextResponse.json({error:'잘못된 금액'},{status:400})
    }
    let userPoints=0
    try{
      const user = await prisma.user.findUnique({where:{id: payload.id}})
      userPoints=user?.points||0
      if(user?.pointsUpdatedAt){
        const diff=Date.now()-new Date(user.pointsUpdatedAt).getTime()
        if(diff>30*24*60*60*1000){ return NextResponse.json({error:'포인트 만료 (30일)', expired:true}) }
      }
    }catch{}
    const maxUsable=Math.floor(totalPrice*0.3)
    if(usePoints>maxUsable) return NextResponse.json({error:`최대 30%만 사용 가능 (최대 ${maxUsable}P)`, maxUsable})
    if(usePoints>userPoints) return NextResponse.json({error:`보유 포인트 부족 (보유: ${userPoints}P)`, has:userPoints})
    return NextResponse.json({ok:true, usable:usePoints, remaining:userPoints-usePoints, payAmount:totalPrice-usePoints})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
