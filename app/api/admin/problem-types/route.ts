import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 문제 유형 목록 (DB 저장). 조회는 누구나, 생성·삭제는 관리자만 가능합니다.
export async function GET() {
  try {
    const types = await prisma.problemType.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json({ types })
  } catch (e: any) {
    console.error('problem-types GET error:', e?.message)
    return NextResponse.json({ types: [] })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const { name, category } = await req.json()
    if (!name || !String(name).trim()) return NextResponse.json({ error: '이름 필요' }, { status: 400 })
    if (!category) return NextResponse.json({ error: '카테고리 필요' }, { status: 400 })
    const created = await prisma.problemType.create({ data: { name: String(name).trim(), category: String(category).trim() } })
    return NextResponse.json({ ok: true, type: created })
  } catch (e: any) {
    console.error('problem-types POST error:', e?.message)
    return NextResponse.json({ error: '유형 저장 실패' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID 필요' }, { status: 400 })
    await prisma.problemType.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('problem-types DELETE error:', e?.message)
    return NextResponse.json({ error: '유형 삭제 실패' }, { status: 500 })
  }
}
