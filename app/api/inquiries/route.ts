import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any
const CATEGORIES = ['버그', '건의', '오답', '기타']
const WINDOW_MS = 10 * 60 * 1000 // 10분
const MAX_PER_WINDOW = 3          // 10분에 3건까지

// 내 문의 목록
export async function GET() {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const items = await prisma.inquiry.findMany({
      where: { userId: auth.session.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, category: true, title: true, body: true, refInfo: true, status: true, adminReply: true, createdAt: true },
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('inquiries GET error:', e?.message)
    return NextResponse.json({ error: '목록을 불러오지 못했습니다' }, { status: 500 })
  }
}

// 문의 등록
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    const category = CATEGORIES.includes(b.category) ? b.category : ''
    const title = typeof b.title === 'string' ? b.title.trim() : ''
    const body = typeof b.body === 'string' ? b.body.trim() : ''
    const refId = typeof b.refId === 'string' && b.refId ? b.refId.slice(0, 100) : null
    const refInfo = typeof b.refInfo === 'string' && b.refInfo ? b.refInfo.slice(0, 200) : null
    if (!category) return NextResponse.json({ error: '문의 종류를 선택하세요' }, { status: 400 })
    if (title.length < 2 || title.length > 100) return NextResponse.json({ error: '제목은 2~100자로 입력하세요' }, { status: 400 })
    if (body.length < 5 || body.length > 2000) return NextResponse.json({ error: '내용은 5~2000자로 입력하세요' }, { status: 400 })

    const recent = await prisma.inquiry.count({
      where: { userId: auth.session.id, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
    })
    if (recent >= MAX_PER_WINDOW) return NextResponse.json({ error: '잠시 후 다시 등록해 주세요 (10분에 3건까지)' }, { status: 429 })

    const item = await prisma.inquiry.create({
      data: { userId: auth.session.id, userLoginId: auth.session.loginId, category, title, body, refId, refInfo },
    })
    return NextResponse.json({ ok: true, id: item.id })
  } catch (e: any) {
    console.error('inquiries POST error:', e?.message)
    return NextResponse.json({ error: '등록 실패' }, { status: 500 })
  }
}
