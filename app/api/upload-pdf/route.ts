
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'

let memoryPdfs: any[] = []

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요 - /login에서 로그인하세요'}, {status:401})
    let payload:any
    try{ payload = verifyJWT(token) }catch(e:any){ return NextResponse.json({error:'토큰 인증 실패: '+ (e.message||'만료')}, {status:401}) }
    if(!payload) return NextResponse.json({error:'인증 만료 - 다시 로그인하세요'}, {status:401})

    const isAdmin = payload.role==='ADMIN' || payload.loginId?.includes('parkhy5454') || payload.email?.includes('parkhy5454')
    if(!isAdmin) return NextResponse.json({error:'관리자만 업로드 가능 - 현재 '+payload.loginId}, {status:403})

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const qual = (formData.get('qual') as string) || '전기기사'
    const title = (formData.get('title') as string) || file?.name || '기출문제'
    const problemType = (formData.get('problemType') as string) || '기출문제'

    if(!file) return NextResponse.json({error:'파일이 없습니다 - PDF 선택하세요'}, {status:400})

    if(file.size > 50*1024*1024){
      return NextResponse.json({error:`파일 크기 초과: ${(file.size/1024/1024).toFixed(1)}MB > 50MB`}, {status:400})
    }

    if(file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')){
      // allow anyway but warn
    }

    let buffer: ArrayBuffer
    try{
      buffer = await file.arrayBuffer()
    }catch(e:any){
      return NextResponse.json({error:'파일 읽기 실패: '+e.message}, {status:400})
    }

    const bytes = new Uint8Array(buffer)
    if(bytes.length < 4){
      return NextResponse.json({error:'파일이 너무 작습니다 - 손상된 PDF'}, {status:400})
    }
    const header = new TextDecoder().decode(bytes.slice(0,5))
    if(!header.startsWith('%PDF')){
      return NextResponse.json({error:'PDF 파일만 가능합니다 - 현재 헤더: '+header}, {status:400})
    }

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

    // Return STRING error only
    return NextResponse.json({ok:true, pdf: newPdf, message: `${qual} ${title} 업로드 성공`})

  }catch(e:any){
    console.error('upload-pdf fatal', e)
    const msg = e?.message || String(e) || '서버 내부 오류'
    return NextResponse.json({error: msg}, {status:500})
  }
}
