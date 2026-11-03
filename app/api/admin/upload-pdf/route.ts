
import { prisma } from '@/lib/db'
export async function POST(req: Request){
  try{
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const type = formData.get('type') as string || '기출문제'
    if(!file || !title || !category) return Response.json({ error:'파일, 제목, 분류 필수' }, { status:400 })
    const fileName = `${Date.now()}_${file.name}`
    let fileUrl = `/uploads/${fileName}`
    const p:any = prisma
    try{
      const flipbook = await p.flipbook.create({ data:{ title, category, type, fileUrl, fileName: file.name, fileSize: file.size } })
      return Response.json({ success:true, flipbook })
    }catch(e:any){
      try{
        const result = await p.$queryRaw`INSERT INTO "Flipbook" (id, title, category, type, "fileUrl", "fileName", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${title}, ${category}, ${type}, ${fileUrl}, ${file.name}, ${file.size}, NOW(), NOW()) RETURNING *`
        return Response.json({ success:true, flipbook: (result as any)[0] })
      }catch(e2:any){
        return Response.json({ error:`DB 테이블 없음. CREATE TABLE "Flipbook" 실행 필요. ${e2.message}` }, { status:500 })
      }
    }
  }catch(e:any){ return Response.json({ error:e.message }, { status:500 }) }
}
