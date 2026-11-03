
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[]})
    let userId = null
    try{
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      userId = payload.id
    }catch{ return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[]}) }

    const me = await prisma.user.findUnique({where:{id:userId}}).catch(()=>null) as any
    if(!me) return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[]})

    let referred: any[] = []
    try{
      referred = await prisma.user.findMany({where:{ referredBy: me.loginId } as any}) as any[]
    }catch{ referred = [] }

    let paidSet = new Set<string>()
    try{
      const paid = await prisma.purchase.findMany({where:{ userId: { in: referred.map((r:any)=>r.id) } }})
      paidSet = new Set(paid.map((p:any)=>p.userId))
    }catch{}

    const points = referred.length * 1000 + paidSet.size * 5000

    return NextResponse.json({
      count: referred.length,
      paidCount: paidSet.size,
      points,
      referredUsers: referred.map((r:any)=>({...r, hasPaid: paidSet.has(r.id)})).reverse()
    })
  }catch{
    return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[]})
  }
}
