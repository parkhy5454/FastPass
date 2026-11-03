
import { prisma } from '@/lib/db'
export async function GET(){
  const p:any = prisma
  try{
    const users = await p.user.findMany({ orderBy:{ createdAt:'desc' }, take:500 })
    return Response.json(users)
  }catch(e:any){
    // Fallback: raw SQL without updatedAt
    try{
      const users = await p.$queryRaw`SELECT id, "loginId", password, name, phone, role, interests, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 500`
      // Add updatedAt dummy
      const mapped = (users as any[]).map(u=>({ ...u, updatedAt: u.createdAt }))
      return Response.json(mapped)
    }catch(e2:any){
      return Response.json({ error: e.message, fallbackError: (e2 as any).message }, { status:500 })
    }
  }
}
