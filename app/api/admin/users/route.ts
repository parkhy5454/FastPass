
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const users = await prisma.user.findMany({ orderBy:{ createdAt:'desc' }, take:200 })
    return Response.json(users)
  }catch(e:any){
    return Response.json({ error: e.message, users:[] }, {status:200})
  }
}
