
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const users = await p.user.findMany({ orderBy:{ createdAt:'desc' }, take:500 })
    return Response.json(users)
  }catch(e:any){ return Response.json([]) }
}
