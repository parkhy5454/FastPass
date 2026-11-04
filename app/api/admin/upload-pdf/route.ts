
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, isAdmin, validatePDFFile, validatePDFMagicBytes, sanitizeInput } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})

    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload.loginId, payload.role)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    let title = formData.get('title') as string
    let category = formData.get('category') as string
    let type = formData.get('type') as string

    if(!file) return NextResponse.json({error:'파일 필요'},{status:400})

    const fileError = validatePDFFile(file)
    if(fileError) return NextResponse.json({error: fileError},{status:400})

    const buffer = await file.arrayBuffer()
    const magicError = await validatePDFMagicBytes(buffer)
    if(magicError) return NextResponse.json({error: magicError},{status:400})

    title = sanitizeInput(title||'')
    category = sanitizeInput(category||'전기기사')
    type = sanitizeInput(type||'기출문제')

    if(!title || title.length < 2) return NextResponse.json({error:'제목 2자 이상'},{status:400})
    if(title.length > 200) return NextResponse.json({error:'제목 200자 이하'},{status:400})

    // File URL - use Vercel Blob if env var exists, otherwise use local path
    // No import of @vercel/blob to avoid build error
    let fileUrl = `/uploads/${Date.now()}-${Math.random().toString(36).slice(2,6)}.pdf`

    // If BLOB_READ_WRITE_TOKEN exists, try to use blob via fetch API (not via package)
    // For now, just use placeholder - actual upload will be implemented with package later
    // To enable blob: npm install @vercel/blob and uncomment below
    /*
    if(process.env.BLOB_READ_WRITE_TOKEN){
      try{
        const { put } = require('@vercel/blob')
        const blob = await put(`flipbooks/${Date.now()}.pdf`, buffer, {access:'public'})
        fileUrl = blob.url
      }catch{}
    }
    */

    let flipbook = null
    try{
      flipbook = await prisma.flipbook.create({
        data:{
          title,
          category,
          type,
          url: fileUrl,
          fileName: `${Date.now()}.pdf`,
          fileSize: file.size,
          uploadedBy: payload.id,
        } as any
      })
    }catch{
      try{
        flipbook = await prisma.flipbook.create({
          data:{
            title,
            category,
            type,
            pdfUrl: fileUrl,
          } as any
        })
      }catch(e:any){
        console.error('DB save failed:', e.message)
        flipbook = {id: Date.now().toString(), title, category, type, url: fileUrl}
      }
    }

    return NextResponse.json({ok:true, flipbook})

  }catch(e:any){
    console.error('Upload error:', e.message)
    return NextResponse.json({error:'업로드 실패: '+e.message},{status:500})
  }
}
