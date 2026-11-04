
import { NextRequest, NextResponse } from 'next/server'

function getExt(name: string){
  const parts=name.split('.')
  return parts.length>1 ? parts.pop()?.toLowerCase() : ''
}

export async function POST(req: NextRequest){
  try{
    const formData = await req.formData()
    const file = formData.get('file') as File
    if(!file) return NextResponse.json({error:'파일 없음'},{status:400})

    const ext = getExt(file.name)
    const allowedExts = ['jpg','jpeg','png','webp','gif','pdf','doc','docx','hwp','hwpx']
    if(ext && !allowedExts.includes(ext)){
      return NextResponse.json({error:`허용되지 않는 파일 형식: ${ext}`},{status:400})
    }
    if(file.size > 10*1024*1024){
      return NextResponse.json({error:'파일은 10MB 이하만 가능'},{status:400})
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    let mime = file.type
    if(!mime){
      if(ext==='pdf') mime='application/pdf'
      else if(ext==='hwp' || ext==='hwpx') mime='application/x-hwp'
      else if(['doc','docx'].includes(ext||'')) mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      else mime='application/octet-stream'
    }
    const dataUrl = `data:${mime};base64,${base64}`

    return NextResponse.json({
      ok:true,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: mime,
      ext,
      isImage: ['jpg','jpeg','png','webp','gif'].includes(ext||''),
      isPdf: ext==='pdf'
    })
  }catch(e:any){
    return NextResponse.json({error:e.message||'업로드 실패'},{status:500})
  }
}
