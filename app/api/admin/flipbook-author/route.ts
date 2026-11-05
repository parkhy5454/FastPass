import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 교재에 저자 연결. 승인된 저자만 연결할 수 있습니다. authorId를 비우면 연결 해제.
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.flipbookId) return NextResponse.json({ error: 'flipbookId 필요' }, { status: 400 })
    if (b.authorId) {
      const author = await prisma.author.findUnique({ where: { id: b.authorId } })
      if (!author || author.status !== '승인') return NextResponse.json({ error: '승인된 저자만 연결할 수 있습니다' }, { status: 400 })
    }
    await prisma.flipbook.update({ where: { id: b.flipbookId }, data: { authorId: b.authorId || null } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('flipbook-author PATCH error:', e?.message)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
