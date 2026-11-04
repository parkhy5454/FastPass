import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 플립북 한 권의 정보 (PDF 주소는 포함하지 않습니다)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const fb = await prisma.flipbook.findUnique({ where: { id: params.id } })
    if (!fb || !fb.isPublished) return NextResponse.json({ error: '없는 자료입니다' }, { status: 404 })
    const isAdminUser = auth.session.role === 'ADMIN'
    // 결제 기능은 아직 없으므로, 유료 자료는 관리자만 볼 수 있습니다.
    if (fb.price > 0 && !isAdminUser) {
      return NextResponse.json({ error: '유료 자료입니다' }, { status: 402 })
    }
    const { pdfUrl, ...meta } = fb
    return NextResponse.json({ ...meta, hasPdf: !!pdfUrl })
  } catch (e: any) {
    console.error('flipbook GET error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}
