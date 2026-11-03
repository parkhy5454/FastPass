
import { prisma } from '@/lib/db'
export async function POST(req: Request){
  try{
    const fd = await req.formData()
    const file = fd.get('file') as File
    const title = fd.get('title') as string
    const category = fd.get('category') as string
    const type = fd.get('type') as string || '기출문제'
    if(!file || !title || !category) return Response.json({ error:'필수 입력' }, {status:400})
    const fileName = `${Date.now()}_${file.name}`
    const fileUrl = `/uploads/${fileName}`
    const p:any = prisma
    try{
      const fb = await p.flipbook.create({ data:{ title, category, type, fileUrl, fileName: file.name, fileSize: file.size } })
      return Response.json({ success:true, flipbook: fb })
    }catch{
      try{
        const r = await p.$queryRaw`INSERT INTO "Flipbook" (id, title, category, type, "fileUrl", "fileName", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${title}, ${category}, ${type}, ${fileUrl}, ${file.name}, ${file.size}, NOW(), NOW()) RETURNING *`
        return Response.json({ success:true, flipbook: (r as any)[0] })
      }catch(e2:any){ return Response.json({ error:`Flipbook 테이블 없음. CREATE TABLE "Flipbook" 실행. ${e2.message}` }, {status:500}) }
    }
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
