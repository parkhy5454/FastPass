
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const purchases = await p.purchase.findMany({ orderBy:{ createdAt:'desc' }, take:200 })
    return Response.json(purchases)
  }catch(e:any){ return Response.json([]) }
}
