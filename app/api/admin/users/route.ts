
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const users = await p.user.findMany({ orderBy:{ createdAt:'desc' }, take:500 })
    return Response.json(users)
  }catch(e:any){
    try{
      const p:any = prisma
      const users = await p.$queryRaw`SELECT id, "loginId", password, name, phone, role, interests, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 500`
      const mapped = (users as any[]).map(u=>({ ...u, updatedAt: u.createdAt }))
      return Response.json(mapped)
    }catch(e2:any){
      return Response.json({ error: (e as any).message, fallback: (e2 as any).message }, {status:500})
    }
  }
}
