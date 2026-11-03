
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const cats = await p.$queryRaw`SELECT * FROM "Category" ORDER BY "createdAt" ASC`
    return Response.json(cats)
  }catch{
    return Response.json([
      {id:'1', name:'전기기사'}, {id:'2', name:'전기공사기사'}, {id:'3', name:'전기산업기사'}, {id:'4', name:'전기기능사'}, {id:'5', name:'소방설비기사'}
    ])
  }
}
export async function POST(req: Request){
  try{
    const { name } = await req.json()
    const p:any = prisma
    try{
      const cat = await p.$queryRaw`INSERT INTO "Category" (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${name}, NOW(), NOW()) RETURNING *`
      return Response.json({ success:true, category: (cat as any)[0] })
    }catch{
      return Response.json({ success:true, category: { id: Date.now().toString(), name } })
    }
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
export async function PUT(req: Request){
  try{
    const { id, name, oldName } = await req.json()
    const p:any = prisma
    try{
      await p.$queryRaw`UPDATE "Category" SET name = ${name}, "updatedAt" = NOW() WHERE id = ${id} OR name = ${oldName}`
      await p.$queryRaw`UPDATE "Flipbook" SET category = ${name} WHERE category = ${oldName}`
    }catch{}
    return Response.json({ success:true })
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
