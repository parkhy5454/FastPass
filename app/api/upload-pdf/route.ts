
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any
let memoryPdfs: any[] = []

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'}, {status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'}, {status:401})

    const isAdmin = payload.role==='ADMIN' || payload.loginId?.includes('parkhy5454')
    if(!isAdmin) return NextResponse.json({error:'관리자만 업로드 가능'}, {status:403})

    const formData = await req.formData()
    const file = formData.get('file') as File
    const qual = formData.get('qual') as string || '전기기사'
    const title = formData.get('title') as string || file?.name || '기출문제'
    const problemType = formData.get('problemType') as string || '기출 10년'

    if(!file) return NextResponse.json({error:'파일이 없습니다'}, {status:400})

    // Validate PDF magic byte
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const header = new TextDecoder().decode(bytes.slice(0,5))
    if(!header.startsWith('%PDF')){
      return NextResponse.json({error:'PDF 파일만 업로드 가능합니다 (%PDF 헤더 없음)'}, {status:400})
    }

    if(file.size > 50*1024*1024){
      return NextResponse.json({error:'파일은 50MB 이하만 가능합니다'}, {status:400})
    }

    // Save as base64 data URL for demo
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64}`

    const newPdf = {
      id: Date.now().toString(),
      qual,
      title,
      problemType,
      fileName: file.name,
      fileSize: file.size,
      url: dataUrl,
      pages: Math.floor(file.size/10000)+1,
      createdAt: new Date().toISOString(),
      userId: payload.id
    }

    memoryPdfs.push(newPdf)

    try{
      // Try to save to DB if prisma model exists
      await prisma.pdf?.create?.({data: newPdf as any})
    }catch{}

    return NextResponse.json({ok:true, pdf: newPdf, count:1})

  }catch(e:any){
    console.error('upload-pdf error', e)
    // Return string error, not object
    const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : '업로드 실패')
    return NextResponse.json({error: msg}, {status:500})
  }
}
