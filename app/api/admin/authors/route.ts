import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any
const STATUSES = ['신청', '승인', '중지']

// 저자 목록 (관리자)
export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const authors = await prisma.author.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ authors })
  } catch (e: any) {
    console.error('admin authors GET error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}

// 승인·중지 처리와 정산 정보 저장 (관리자)
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })
    const data: any = {}
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return NextResponse.json({ error: '상태 값이 올바르지 않습니다' }, { status: 400 })
      data.status = b.status
    }
    if (b.bankInfo !== undefined) data.bankInfo = b.bankInfo
    await prisma.author.update({ where: { id: b.id }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin authors PATCH error:', e?.message)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
