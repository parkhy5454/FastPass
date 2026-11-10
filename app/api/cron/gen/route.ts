import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'
import { generateRound, validateRound, nextRoundFrom } from '@/lib/questionGen'

const prisma = db as any

// 정해진 시간에 다음 회차 초안을 자동 생성합니다. 공개는 하지 않고 검수 대기로만 둡니다.
// Vercel Cron은 Authorization: Bearer <CRON_SECRET> 헤더를 보냅니다.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: '권한 없음' }, { status: 401 })
  }
  const category = '전기기사'
  try {
    // 검수 대기 초안이 이미 있으면 새로 만들지 않습니다 (검수가 밀리지 않게)
    const pending = await prisma.examDraft.count({ where: { category, status: '검수대기' } })
    if (pending > 0) return NextResponse.json({ ok: true, skipped: 'pending draft exists' })
    const rounds = await prisma.examRound.findMany({ where: { category }, select: { round: true } })
    const drafts = await prisma.examDraft.findMany({ where: { category }, select: { round: true } })
    const round = nextRoundFrom([...rounds, ...drafts].map((r: any) => r.round))
    const { source, questions } = await generateRound(category, round)
    const errors = validateRound(category, questions)
    const draft = await prisma.examDraft.create({ data: { category, round, source, payload: questions, errors } })
    return NextResponse.json({ ok: true, id: draft.id, round, source, errorCount: errors.length })
  } catch (e: any) {
    console.error('cron gen error:', e?.message)
    return NextResponse.json({ error: '생성 실패' }, { status: 500 })
  }
}
