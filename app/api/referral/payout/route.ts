
import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest){
  try{
    const { userId } = await req.json()
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({where:{id:userId}}).catch(()=>null) as any
    if(!user || !user.referredBy) return NextResponse.json({ok:true})
    const referrer = await prisma.user.findFirst({where:{loginId: user.referredBy}}).catch(()=>null) as any
    if(!referrer) return NextResponse.json({ok:true})
    await prisma.user.update({where:{id: referrer.id}, data:{ points: { increment: 5000 } } as any}).catch(()=>null)
    return NextResponse.json({ok:true, points:5000})
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
