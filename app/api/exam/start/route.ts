import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'
import { hasExamAccess } from '@/lib/exam'

const prisma = db as any

// 응시 시작: 시작 시각과 마감 시각을 서버가 기록합니다. 정답은 내려보내지 않습니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const { category, round } = await req.json().catch(() => ({}))
    if (!category || !round) return NextResponse.json({ error: '자격증과 회차가 필요합니다' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: auth.session.id } }).catch(() => null)
    if (!hasExamAccess(auth.session, user)) {
      return NextResponse.json({ error: '구독 후 이용할 수 있습니다', code: 'NO_SUBSCRIPTION' }, { status: 402 })
    }

    const questions = await prisma.examQuestion.findMany({
      where: { category, round: String(round) },
      orderBy: { number: 'asc' },
      select: { id: true, subject: true, number: true, content: true, choices: true },
    })
    if (!questions.length) return NextResponse.json({ error: '등록된 문제가 없습니다' }, { status: 404 })

    const setting = await prisma.examRound.findUnique({ where: { category_round: { category, round: String(round) } } }).catch(() => null)
    const durationMin = setting?.durationMin ?? 150

    const now = new Date()
    const deadlineAt = new Date(now.getTime() + durationMin * 60 * 1000)
    const attempt = await prisma.examAttempt.create({
      data: { userId: auth.session.id, category, round: String(round), startedAt: now, deadlineAt },
    })
    return NextResponse.json({
      attemptId: attempt.id,
      serverNow: now.toISOString(),
      deadlineAt: deadlineAt.toISOString(),
      durationMin,
      questions,
    })
  } catch (e: any) {
    console.error('exam start error:', e?.message)
    return NextResponse.json({ error: '시작 실패' }, { status: 500 })
  }
}
