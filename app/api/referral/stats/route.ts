
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient() as any
export async function GET(){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[], leaderboard:[]})
    let userId = null
    try{ const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); userId = payload.id }catch{ return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[], leaderboard:[]}) }
    const me = await prisma.user.findUnique({where:{id:userId}}).catch(()=>null) as any
    if(!me) return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[], leaderboard:[]})
    let referred: any[] = []
    try{ referred = await prisma.user.findMany({where:{ referredBy: me.loginId } as any}) as any[] }catch{ referred = [] }
    let paidSet = new Set<string>()
    try{ const paid = await prisma.purchase?.findMany?.({where:{ userId: { in: referred.map((r:any)=>r.id) } }}) || []; paidSet = new Set(paid.map((p:any)=>p.userId)) }catch{}
    const points = referred.length * 1000 + paidSet.size * 5000
    let leaderboard: any[] = []
    try{
      const allUsers = await prisma.user.findMany({select:{loginId:true, name:true, referredBy:true} as any}).catch(()=>[]) as any[]
      const countMap: Record<string, number> = {}
      allUsers.forEach((u:any)=>{ if(u.referredBy) countMap[u.referredBy] = (countMap[u.referredBy]||0)+1 })
      leaderboard = Object.entries(countMap).map(([loginId, count])=>{ const user = allUsers.find((u:any)=>u.loginId===loginId); return {loginId, name: user?.name||loginId, count} }).sort((a,b)=>b.count-a.count).slice(0,10)
    }catch{}
    return NextResponse.json({count: referred.length, paidCount: paidSet.size, points, referredUsers: referred.map((r:any)=>({...r, hasPaid: paidSet.has(r.id)})).reverse(), leaderboard})
  }catch{ return NextResponse.json({count:0, points:0, paidCount:0, referredUsers:[], leaderboard:[]}) }
}
