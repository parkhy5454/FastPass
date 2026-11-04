
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, isAdmin, validatePDFMagicBytes, sanitizeInput, validatePDFFile } from '@/lib/security'

let memoryPdfs: any[] = []

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    let title = formData.get('title') as string || '기출문제'
    const qual = formData.get('qual') as string || '전기기사'
    const problemType = formData.get('problemType') as string || '기출문제'

    if(!file) return NextResponse.json({error:'파일 없음'}, {status:400})

    const pdfCheck = validatePDFFile(file as any)
    if(!pdfCheck.valid) return NextResponse.json({error: pdfCheck.error}, {status:400})

    const buffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(buffer)

    const isValidPdf = validatePDFMagicBytes(uint8)
    if(!isValidPdf){
      return NextResponse.json({error:'PDF 파일만 가능합니다 (%PDF 헤더 없음)'}, {status:400})
    }

    title = sanitizeInput(title||'')

    const newPdf = {
      id: Date.now().toString(),
      qual,
      title,
      problemType,
      fileName: file.name,
      fileSize: file.size,
      pages: Math.max(1, Math.floor(file.size/15000)),
      createdAt: new Date().toISOString(),
      userId: payload.id
    }

    memoryPdfs.push(newPdf)

    return NextResponse.json({ok:true, pdf: newPdf})

  }catch(e:any){
    console.error('admin upload-pdf error', e)
    const msg = e?.message || String(e) || '업로드 실패'
    return NextResponse.json({error: msg}, {status:500})
  }
}
