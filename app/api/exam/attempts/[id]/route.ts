import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 제출한 응시의 정답·해설 (본인 또는 관리자만, 제출 후에만)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const attempt = await prisma.examAttempt.findUnique({ where: { id: params.id } })
    if (!attempt) return NextResponse.json({ error: '응시 기록이 없습니다' }, { status: 404 })
    const isOwner = attempt.userId === auth.session.id
    if (!isOwner && auth.session.role !== 'ADMIN') return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    if (!attempt.submittedAt) return NextResponse.json({ error: '아직 제출하지 않은 응시입니다' }, { status: 409 })

    const questions = await prisma.examQuestion.findMany({
      where: { category: attempt.category, round: attempt.round },
      orderBy: { number: 'asc' },
    })
    const answers = (attempt.answers || {}) as Record<string, number>
    return NextResponse.json({
      attempt: {
        id: attempt.id, category: attempt.category, round: attempt.round,
        startedAt: attempt.startedAt, submittedAt: attempt.submittedAt,
        total: attempt.total, passed: attempt.passed, timedOut: attempt.timedOut,
        result: attempt.result,
      },
      questions: questions.map((q: any) => ({
        id: q.id, subject: q.subject, number: q.number, content: q.content, choices: q.choices,
        answer: q.answer, explanation: q.explanation, mine: answers[q.id] ?? null,
        correct: answers[q.id] === q.answer,
      })),
    })
  } catch (e: any) {
    console.error('exam attempt detail error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}
