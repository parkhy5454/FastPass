import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'
import { hasExamAccess } from '@/lib/exam'

const prisma = db as any

// 자격증별 회차 목록 (구독자 또는 관리자만)
export async function GET(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const category = req.nextUrl.searchParams.get('category') || ''
  if (!category) return NextResponse.json({ error: 'category 필요' }, { status: 400 })
  try {
    const user = await prisma.user.findUnique({ where: { id: auth.session.id } }).catch(() => null)
    if (!hasExamAccess(auth.session, user)) {
      return NextResponse.json({ error: '구독 후 이용할 수 있습니다', code: 'NO_SUBSCRIPTION' }, { status: 402 })
    }
    const questions = await prisma.examQuestion.findMany({ where: { category }, select: { round: true } })
    const counts: Record<string, number> = {}
    questions.forEach((q: any) => { counts[q.round] = (counts[q.round] || 0) + 1 })
    const settings = await prisma.examRound.findMany({ where: { category } })
    const byRound: Record<string, any> = {}
    settings.forEach((s: any) => { byRound[s.round] = s })
    const rounds = Object.keys(counts).sort().map(r => ({
      round: r,
      questionCount: counts[r],
      durationMin: byRound[r]?.durationMin ?? 150,
      passScore: byRound[r]?.passScore ?? 60,
    }))
    return NextResponse.json({ rounds })
  } catch (e: any) {
    console.error('exam rounds error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}
