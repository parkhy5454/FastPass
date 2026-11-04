import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 답안 임시 저장: 고른 답을 서버에 남겨 두어 새로고침해도 사라지지 않게 합니다.
// 제출 전 응시 중에만 가능하며, 시간이 지나면 저장을 거부합니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const { attemptId, answers } = await req.json().catch(() => ({}))
    if (!attemptId || typeof attemptId !== 'string') return NextResponse.json({ error: 'attemptId 필요' }, { status: 400 })

    const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } })
    if (!attempt || attempt.userId !== auth.session.id) return NextResponse.json({ error: '응시 기록이 없습니다' }, { status: 404 })
    if (attempt.submittedAt) return NextResponse.json({ error: '이미 제출했습니다' }, { status: 409 })
    if (new Date() > new Date(attempt.deadlineAt)) return NextResponse.json({ error: '제한 시간이 끝났습니다' }, { status: 409 })

    const questions = await prisma.examQuestion.findMany({
      where: { category: attempt.category, round: attempt.round },
      select: { id: true },
    })
    const valid = new Set(questions.map((q: any) => q.id))
    const clean: Record<string, number> = {}
    if (answers && typeof answers === 'object') {
      for (const [k, v] of Object.entries(answers)) {
        if (valid.has(k) && Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 4) clean[k] = v as number
      }
    }
    // 화면의 전체 답안 묶음으로 덮어씁니다 (한 사용자가 한 응시만 다루므로 충돌이 없습니다).
    await prisma.examAttempt.updateMany({
      where: { id: attemptId, submittedAt: null },
      data: { answers: clean },
    })
    return NextResponse.json({ ok: true, saved: Object.keys(clean).length })
  } catch (e: any) {
    console.error('exam save error:', e?.message)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
