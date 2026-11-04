import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'
import { scoreAttempt } from '@/lib/exam'

const prisma = db as any
const GRACE_MS = 15 * 1000 // 마감 직후 네트워크 지연 허용 시간

// 제출 및 채점. 한 응시에 한 번만 저장됩니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const { attemptId, answers } = await req.json().catch(() => ({}))
    if (!attemptId || typeof attemptId !== 'string') return NextResponse.json({ error: 'attemptId 필요' }, { status: 400 })

    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt || attempt.userId !== auth.session.id) return NextResponse.json({ error: '응시 기록이 없습니다' }, { status: 404 })
    if (attempt.submittedAt) return NextResponse.json({ error: '이미 제출했습니다' }, { status: 409 })

    const questions = await prisma.examQuestion.findMany({
      where: { category: attempt.category, round: attempt.round },
      select: { id: true, subject: true, answer: true },
    })
    // 문항 번호 1~4만 인정 (그 외 값은 무시)
    const clean: Record<string, number> = {}
    const valid = new Set(questions.map((q: any) => q.id))
    if (answers && typeof answers === 'object') {
      for (const [k, v] of Object.entries(answers)) {
        if (valid.has(k) && Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 4) clean[k] = v as number
      }
    }

    const setting = await prisma.examRound.findUnique({ where: { category_round: { category: attempt.category, round: attempt.round } } }).catch(() => null)
    const result = scoreAttempt(questions, clean, setting?.passScore ?? 60, setting?.subjectMin ?? 0)
    const now = new Date()
    const timedOut = now.getTime() > new Date(attempt.deadlineAt).getTime() + GRACE_MS

    // 동시에 두 번 눌러도 한 번만 저장되도록 조건을 걸어 갱신합니다.
    const updated = await prisma.examAttempt.updateMany({
      where: { id: attemptId, submittedAt: null },
      data: { submittedAt: now, answers: clean, result, total: Math.round(result.total), passed: result.passed, timedOut },
    })
    if (updated.count === 0) return NextResponse.json({ error: '이미 제출했습니다' }, { status: 409 })

    return NextResponse.json({ ok: true, total: result.total, passed: result.passed, bySubject: result.bySubject, timedOut })
  } catch (e: any) {
    console.error('exam submit error:', e?.message)
    return NextResponse.json({ error: '제출 실패' }, { status: 500 })
  }
}
