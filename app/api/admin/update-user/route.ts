
import { prisma } from '@/lib/db'
export async function POST(req: Request){
  try{
    const { loginId, interests, name, phone } = await req.json()
    const p:any = prisma
    const data:any = {}
    if(interests !== undefined) data.interests = interests
    if(name !== undefined) data.name = name
    if(phone !== undefined) data.phone = phone
    
    try{
      const user = await p.user.update({ where:{ loginId }, data })
      return Response.json({ success:true, user })
    }catch(e:any){
      // Fallback raw query for interests
      if(interests !== undefined){
        try{
          await p.$queryRaw`UPDATE "User" SET interests = ${interests}::text[], "updatedAt" = NOW() WHERE "loginId" = ${loginId}`
          return Response.json({ success:true })
        }catch(e2:any){
          return Response.json({ error: e2.message }, {status:500})
        }
      }
      return Response.json({ error:e.message }, {status:500})
    }
  }catch(e:any){
    return Response.json({ error:(e as any).message }, {status:500})
  }
}
