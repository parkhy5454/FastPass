
import { prisma } from '@/lib/db'
export async function POST(req: Request){
  try{
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const type = formData.get('type') as string || '기출문제'

    if(!file || !title || !category){
      return Response.json({ error:'파일, 제목, 분류 필수' }, { status:400 })
    }

    // 파일명 생성
    const fileName = `${Date.now()}_${file.name}`
    
    // Vercel Blob 또는 로컬 저장 시도
    let fileUrl = `/uploads/${fileName}`
    
    // 실제 파일 저장 로직은 Vercel Blob 사용 권장
    // 지금은 DB에만 메타데이터 저장
    try{
      // @vercel/blob이 있으면 사용
      // const { put } = await import('@vercel/blob')
      // const blob = await put(fileName, file, { access:'public' })
      // fileUrl = blob.url
    }catch{}

    const p:any = prisma
    
    // Flipbook 테이블에 저장
    try{
      const flipbook = await p.flipbook.create({
        data:{
          title,
          category,
          type,
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
        }
      })
      return Response.json({ success:true, flipbook })
    }catch(e:any){
      // 테이블 없으면 Question으로 fallback 또는 raw query
      try{
        const result = await p.$queryRaw`INSERT INTO "Flipbook" (id, title, category, type, "fileUrl", "fileName", "fileSize", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, ${title}, ${category}, ${type}, ${fileUrl}, ${file.name}, ${file.size}, NOW(), NOW()) RETURNING *`
        return Response.json({ success:true, flipbook: (result as any)[0] })
      }catch(e2:any){
        // Flipbook 테이블 생성 SQL 반환
        return Response.json({ 
          error:`DB 테이블 없음. Neon에서 실행:\nCREATE TABLE "Flipbook" (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, title TEXT NOT NULL, category TEXT NOT NULL, type TEXT DEFAULT '기출문제', "fileUrl" TEXT, "fileName" TEXT, "fileSize" INTEGER, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());\n에러: ${e2.message}` 
        }, { status:500 })
      }
    }
  }catch(e:any){
    return Response.json({ error:e.message }, { status:500 })
  }
}
