import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'
import { signPdfUrl } from '@/lib/r2'

const prisma = db as any

// 로그인한 사용자에게만 10분짜리 PDF 주소를 발급합니다.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const fb = await prisma.flipbook.findUnique({ where: { id: params.id } })
    if (!fb || !fb.isPublished || !fb.pdfUrl) return NextResponse.json({ error: '파일이 없습니다' }, { status: 404 })
    const isAdminUser = auth.session.role === 'ADMIN'
    if (fb.price > 0 && !isAdminUser) {
      return NextResponse.json({ error: '유료 자료입니다' }, { status: 402 })
    }
    const url = await signPdfUrl(fb.pdfUrl)
    if (!url) return NextResponse.json({ error: '파일 저장소 설정 오류' }, { status: 500 })
    return NextResponse.json({ url })
  } catch (e: any) {
    console.error('flipbook pdf GET error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}
