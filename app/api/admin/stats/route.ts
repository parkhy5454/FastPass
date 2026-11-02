
import { prisma } from '@/lib/db'
export async function GET(){
  try {
    const totalUsers = await prisma.user.count()
    const today = new Date(); today.setHours(0,0,0,0)
    const todayJoins = await prisma.user.count({ where: { createdAt: { gte: today } } })
    let totalRevenue = 0
    try {
      const agg:any = await prisma.purchase.aggregate({ _sum: { amount: true } } as any)
      totalRevenue = agg._sum?.amount || 0
    } catch {}
    return Response.json({ totalUsers, todayJoins, totalRevenue })
  } catch(e:any){
    return Response.json({ totalUsers:0, todayJoins:0, totalRevenue:0, error:e.message })
  }
}
