import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma as db } from '@/lib/db'
import { generateRound, validateRound, nextRoundFrom, SUBJECTS } from '@/lib/questionGen'

const prisma = db as any

// 초안 목록 (관리자)
export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const drafts = await prisma.examDraft.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json({ drafts })
  } catch (e: any) {
    console.error('gen GET error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}

// 다음 회차 초안 생성 (AI 또는 샘플). 공개하지 않고 검수 대기로 저장합니다.
export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    const category = typeof b.category === 'string' ? b.category : '전기기사'
    if (!SUBJECTS[category]) return NextResponse.json({ error: '지원하지 않는 자격증입니다' }, { status: 400 })
    const rounds = await prisma.examRound.findMany({ where: { category }, select: { round: true } })
    const drafts = await prisma.examDraft.findMany({ where: { category }, select: { round: true } })
    const round = nextRoundFrom([...rounds, ...drafts].map((r: any) => r.round))
    const { source, questions } = await generateRound(category, round)
    const errors = validateRound(category, questions)
    const draft = await prisma.examDraft.create({
      data: { category, round, source, payload: questions, errors },
    })
    return NextResponse.json({ ok: true, id: draft.id, round, source, errorCount: errors.length })
  } catch (e: any) {
    console.error('gen POST error:', e?.message)
    return NextResponse.json({ error: e?.message || '생성 실패' }, { status: 500 })
  }
}

// 승인: 검증 오류가 없고 샘플이 아닌 초안만 회차로 공개됩니다. 반려는 상태만 바꿉니다.
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    if (!b.id || !['approve', 'reject'].includes(b.action)) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    const draft = await prisma.examDraft.findUnique({ where: { id: b.id } })
    if (!draft) return NextResponse.json({ error: '초안이 없습니다' }, { status: 404 })
    if (draft.status !== '검수대기') return NextResponse.json({ error: '이미 처리된 초안입니다' }, { status: 409 })

    if (b.action === 'reject') {
      await prisma.examDraft.update({ where: { id: b.id }, data: { status: '반려' } })
      return NextResponse.json({ ok: true })
    }
    if (draft.source !== 'anthropic') return NextResponse.json({ error: '샘플 초안은 공개할 수 없습니다 (AI 키 연결 후 생성된 초안만 승인)' }, { status: 400 })
    const errors = validateRound(draft.category, draft.payload)
    if (errors.length) return NextResponse.json({ error: '검증 오류가 있어 승인할 수 없습니다', errors }, { status: 400 })

    const rows = (draft.payload as any[]).map((q: any) => ({
      category: draft.category, round: draft.round, subject: q.subject, number: q.number,
      content: q.content, choices: q.choices, answer: q.answer, explanation: q.explanation || null,
    }))
    await prisma.$transaction([
      prisma.examRound.upsert({
        where: { category_round: { category: draft.category, round: draft.round } },
        update: {},
        create: { category: draft.category, round: draft.round, durationMin: 150, passScore: 60, subjectMin: 0 },
      }),
      prisma.examQuestion.deleteMany({ where: { category: draft.category, round: draft.round } }),
      prisma.examQuestion.createMany({ data: rows }),
      prisma.examDraft.update({ where: { id: b.id }, data: { status: '승인' } }),
    ])
    return NextResponse.json({ ok: true, published: rows.length })
  } catch (e: any) {
    console.error('gen PATCH error:', e?.message)
    return NextResponse.json({ error: '처리 실패' }, { status: 500 })
  }
}
