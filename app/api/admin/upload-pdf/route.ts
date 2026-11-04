import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { validatePDFFile, validatePDFMagicBytes, sanitizeInput } from '@/lib/security'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

// PDF를 Vercel Blob에 저장하고, 플립북 행에 주소를 기록합니다.
export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: '파일 저장소(Vercel Blob)가 연결되어 있지 않습니다' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })

    const sizeCheck = validatePDFFile(file)
    if (!sizeCheck.valid) return NextResponse.json({ error: sizeCheck.error }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const magic = validatePDFMagicBytes(buffer)
    if (!magic.valid) return NextResponse.json({ error: magic.error }, { status: 400 })

    const title = sanitizeInput(String(formData.get('title') || ''))
    const category = sanitizeInput(String(formData.get('category') || '')) || '전기기사'
    const type = sanitizeInput(String(formData.get('type') || '')) || '기출문제'
    if (title.length < 2 || title.length > 200) {
      return NextResponse.json({ error: '제목은 2~200자로 입력하세요' }, { status: 400 })
    }

    const key = `flipbooks/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`
    const blob = await put(key, Buffer.from(buffer), { access: 'public', contentType: 'application/pdf' })

    const flipbook = await (prisma as any).flipbook.create({
      data: {
        title,
        category,
        type,
        pdfUrl: blob.url,
        fileName: file.name.slice(0, 200),
        fileSize: file.size,
        totalPages: 0,
        isPublished: true,
      },
    })

    await logAudit('PDF_UPLOAD', auth.session.loginId, flipbook.id, { title, category, type })
    return NextResponse.json({ ok: true, flipbook })
  } catch (e: any) {
    console.error('upload-pdf error:', e?.message)
    return NextResponse.json({ error: '업로드 실패. 잠시 후 다시 시도하세요' }, { status: 500 })
  }
}
