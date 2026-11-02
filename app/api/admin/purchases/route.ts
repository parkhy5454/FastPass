
import { prisma } from '@/lib/db'
export async function GET(){
  try {
    const purchases = await prisma.purchase.findMany({ orderBy: { createdAt: 'desc' }, take: 100 } as any)
    return Response.json(purchases)
  } catch(e:any){
    return Response.json([])
  }
}
