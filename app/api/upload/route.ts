import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'hwp', 'hwpx']
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_BYTES = 10 * 1024 * 1024

function getExt(name: string) {
  const parts = name.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : ''
}

// 로그인 사용자만 업로드 가능. 파일은 서버에 저장하지 않고 data URL로 돌려줍니다 (기존 동작 유지).
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: '파일 없음' }, { status: 400 })

    const ext = getExt(file.name)
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: `허용되지 않는 파일 형식: ${ext || '(없음)'}` }, { status: 400 })
    }
    if (file.size > MAX_BYTES) return NextResponse.json({ error: '파일은 10MB 이하만 가능' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let mime = file.type
    if (!mime) {
      if (ext === 'pdf') mime = 'application/pdf'
      else if (ext === 'hwp' || ext === 'hwpx') mime = 'application/x-hwp'
      else if (ext === 'doc' || ext === 'docx') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      else mime = 'application/octet-stream'
    }
    return NextResponse.json({
      ok: true,
      url: `data:${mime};base64,${buffer.toString('base64')}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: mime,
      ext,
      isImage: IMAGE_EXTS.includes(ext),
      isPdf: ext === 'pdf',
    })
  } catch {
    return NextResponse.json({ error: '업로드 실패' }, { status: 500 })
  }
}
