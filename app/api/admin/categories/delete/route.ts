
import { prisma } from '@/lib/db'
export async function POST(req: Request){
  try{
    const { id, name } = await req.json()
    const p:any = prisma
    try{
      await p.$queryRaw`DELETE FROM "Category" WHERE id = ${id} OR name = ${name}`
      await p.$queryRaw`UPDATE "Flipbook" SET category = '기타' WHERE category = ${name}`
    }catch{}
    return Response.json({ success:true })
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
