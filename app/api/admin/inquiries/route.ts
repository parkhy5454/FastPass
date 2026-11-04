import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any
const CATEGORIES = ['버그', '건의', '오답', '기타']
const STATUSES = ['접수', '확인', '처리완료']

// 전체 문의 목록 (관리자)
export async function GET(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const where: any = {}
    if (status && STATUSES.includes(status)) where.status = status
    if (category && CATEGORIES.includes(category)) where.category = category
    const items = await prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: 300 })
    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('admin inquiries GET error:', e?.message)
    return NextResponse.json({ error: '목록을 불러오지 못했습니다' }, { status: 500 })
  }
}

// 상태 변경 및 답변 저장 (관리자)
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.id || typeof b.id !== 'string') return NextResponse.json({ error: 'id 필요' }, { status: 400 })
    const data: any = {}
    if (b.status !== undefined) {
      if (!STATUSES.includes(b.status)) return NextResponse.json({ error: '상태 값이 올바르지 않습니다' }, { status: 400 })
      data.status = b.status
    }
    if (b.adminReply !== undefined) {
      data.adminReply = typeof b.adminReply === 'string' && b.adminReply.trim() ? b.adminReply.trim().slice(0, 2000) : null
    }
    await prisma.inquiry.update({ where: { id: b.id }, data })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin inquiries PATCH error:', e?.message)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
