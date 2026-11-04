import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

const p: any = prisma

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json([])
  const notes = await p.wrongNote?.findMany?.({ where: { userId: session.id }, orderBy: { updatedAt: 'desc' } }).catch(() => []) || []
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  const { questionId, questionTitle, category } = await req.json().catch(() => ({}))
  if (!questionId) return NextResponse.json({ error: 'questionId 필요' }, { status: 400 })
  try {
    const existing = await p.wrongNote.findFirst({ where: { userId: session.id, questionId } }).catch(() => null)
    if (existing) {
      const updated = await p.wrongNote.update({ where: { id: existing.id }, data: { count: { increment: 1 } } })
      return NextResponse.json(updated)
    }
    const created = await p.wrongNote.create({
      data: { userId: session.id, questionId: String(questionId), questionTitle: questionTitle || '', category: category || '', count: 1 },
    })
    return NextResponse.json(created)
  } catch {
    return NextResponse.json({ error: '오답노트 저장 실패' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSession()
  if (!session) return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  const { questionId } = await req.json().catch(() => ({}))
  await p.wrongNote?.deleteMany?.({ where: { userId: session.id, questionId } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
