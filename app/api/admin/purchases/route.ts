
import { prisma } from '@/lib/db'
export async function GET(){
  const p:any = prisma
  try{
    const purchases = await p.purchase.findMany({ orderBy:{ createdAt:'desc' }, take:200 })
    return Response.json(purchases)
  }catch(e:any){
    try{
      const purchases = await p.$queryRaw`SELECT * FROM "Purchase" ORDER BY "createdAt" DESC LIMIT 200`
      return Response.json(purchases)
    }catch{
      return Response.json([])
    }
  }
}
