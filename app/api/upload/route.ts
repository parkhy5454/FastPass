
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TYPES = {
  image: ['image/jpeg','image/png','image/webp','image/gif'],
  pdf: ['application/pdf'],
  doc: ['application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.hancom.hwp','application/x-hwp','application/haansofthwp','application/octet-stream'],
}
const ALL_ALLOWED = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.pdf, ...ALLOWED_TYPES.doc, 'application/haansofthwp', 'application/x-hwp']

function getExt(name: string){
  const parts=name.split('.')
  return parts.length>1 ? parts.pop()?.toLowerCase() : ''
}

export async function POST(req: NextRequest){
  try{
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'job'

    if(!file) return NextResponse.json({error:'파일 없음'},{status:400})

    const ext = getExt(file.name)
    const allowedExts = ['jpg','jpeg','png','webp','gif','pdf','doc','docx','hwp','hwpx']
    if(ext && !allowedExts.includes(ext)){
      return NextResponse.json({error:`허용되지 않는 파일 형식: ${ext}`},{status:400})
    }

    if(file.size > 10*1024*1024){
      return NextResponse.json({error:'파일은 10MB 이하만 가능'},{status:400})
    }

    // Convert to base64 data URL for storage (Vercel ephemeral FS workaround)
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mime = file.type || (ext==='pdf' ? 'application/pdf' : ext==='hwp' ? 'application/x-hwp' : 'image/jpeg')
    const dataUrl = `data:${mime};base64,${base64}`

    // Try Vercel Blob if available, fallback to data URL
    let url = dataUrl
    try{
      // @ts-ignore
      const { put } = await import('@vercel/blob').catch(()=>({put:null}))
      if(put){
        const blob = await put(`jobs/${Date.now()}-${file.name}`, file, { access: 'public' })
        url = blob.url
      }
    }catch{}

    return NextResponse.json({
      ok:true,
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: mime,
      ext,
      isImage: ALLOWED_TYPES.image.includes(mime) || ['jpg','jpeg','png','webp','gif'].includes(ext||''),
      isPdf: mime==='application/pdf' || ext==='pdf'
    })
  }catch(e:any){
    return NextResponse.json({error:e.message||'업로드 실패'},{status:500})
  }
}
