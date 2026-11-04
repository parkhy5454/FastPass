
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const result:any = {}
    
    try{
      const userCount = await p.user.count()
      result.userCount = userCount
    }catch(e:any){ result.userCountError = e.message }
    
    try{
      const users = await p.user.findMany({ take:5, orderBy:{ createdAt:'desc' } })
      result.sampleUsers = users.map((u:any)=>({ loginId: u.loginId, name: u.name, role: u.role, createdAt: u.createdAt }))
    }catch(e:any){ result.sampleError = e.message }
    
    try{
      result.hasUserTable = !!p.user
      result.hasPurchaseTable = !!p.purchase
    }catch{}
    
    result.env = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.slice(0,30) || '없음'
    }
    
    return Response.json(result)
  }catch(e:any){
    return Response.json({ error:e.message, stack:e.stack })
  }
}
