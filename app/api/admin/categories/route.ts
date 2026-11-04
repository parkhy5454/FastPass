import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'

const DEFAULT_CATEGORIES = [
  '건축전기설비기술사', '발송배전기술사', '전기응용기술사', '전기안전기술사', '전기철도기술사',
  '전기기능장',
  '전기기사', '전기공사기사', '전기철도기사', '철도신호기사', '소방설비기사(전기)', '건축전기설비기사',
  '전기산업기사', '전기공사산업기사', '전기철도산업기사', '소방설비산업기사(전기)',
  '전기기능사', '전기공사기능사', '소방설비기능사(전기)', '전기철도기능사', '승강기기능사', '신재생에너지발전설비기능사',
]

export async function GET() {
  try {
    const cats = await (prisma as any).category.findMany({ orderBy: { name: 'asc' } }).catch(() => null)
    if (cats && cats.length > 0) return NextResponse.json(cats)
  } catch {}
  return NextResponse.json(DEFAULT_CATEGORIES.map((name, i) => ({ id: String(i + 1), name })))
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  const { name } = await req.json().catch(() => ({}))
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: '이름 2자 이상' }, { status: 400 })
  }
  try {
    const c = await (prisma as any).category.create({ data: { name: name.trim() } })
    return NextResponse.json(c)
  } catch {
    return NextResponse.json({ error: '카테고리 생성 실패' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })
  try {
    await (prisma as any).category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}
