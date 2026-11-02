
import { prisma } from '@/lib/db'
export async function GET(){
  try {
    const purchases = await prisma.purchase.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { user: { select: { loginId:true, name:true } } } as any })
    return Response.json(purchases)
  } catch(e:any){
    // If Purchase table doesn't exist or relation fails, try without include
    try {
      const purchases = await prisma.purchase.findMany({ orderBy: { createdAt: 'desc' }, take: 100 } as any)
      return Response.json(purchases)
    } catch(e2:any){
      return Response.json([], {status:200})
    }
  }
}
