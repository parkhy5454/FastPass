import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

const p: any = prisma

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json([])
  const bookmarks = await p.bookmark?.findMany?.({ where: { userId: session.id }, orderBy: { createdAt: 'desc' } }).catch(() => []) || []
  return NextResponse.json(bookmarks)
}

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  const { questionId } = await req.json().catch(() => ({}))
  if (!questionId) return NextResponse.json({ error: 'questionId 필요' }, { status: 400 })
  try {
    const existing = await p.bookmark.findFirst({ where: { userId: session.id, questionId } }).catch(() => null)
    if (existing) return NextResponse.json(existing)
    const created = await p.bookmark.create({ data: { userId: session.id, questionId } })
    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: '북마크 저장 실패' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  const { questionId } = await req.json().catch(() => ({}))
  if (!questionId) return NextResponse.json({ error: 'questionId 필요' }, { status: 400 })
  await p.bookmark?.deleteMany?.({ where: { userId: session.id, questionId } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
