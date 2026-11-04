import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma as db } from '@/lib/db'
import { csvToExamRows } from '@/lib/exam'
import { logAudit } from '@/lib/audit'

const prisma = db as any

// CSV 문제 일괄 등록. 오류가 하나라도 있으면 아무것도 저장하지 않습니다.
export async function POST(req: NextRequest) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const body = await req.json().catch(() => ({}))
    const csv = typeof body.csv === 'string' ? body.csv : ''
    if (!csv.trim()) return NextResponse.json({ error: 'CSV 내용이 없습니다' }, { status: 400 })

    const { rows, errors } = csvToExamRows(csv)
    if (errors.length) return NextResponse.json({ error: '오류가 있어 저장하지 않았습니다', errors }, { status: 400 })
    if (rows.length > 2000) return NextResponse.json({ error: '한 번에 2000문항까지 올릴 수 있습니다' }, { status: 400 })

    const durationMin = Math.min(600, Math.max(1, Number(body.durationMin) || 150))
    const passScore = Math.min(100, Math.max(0, Number(body.passScore) || 60))
    const subjectMin = Math.min(100, Math.max(0, Number(body.subjectMin) || 0))

    const rounds = new Map<string, { category: string; round: string }>()
    rows.forEach(r => rounds.set(`${r.category}|${r.round}`, { category: r.category, round: r.round }))

    // 문항을 하나씩 upsert하면 Vercel 제한 시간(10초)을 넘을 수 있어서,
    // 회차별로 기존 문항을 지우고 한 번의 createMany로 넣습니다. 전체가 하나의 트랜잭션입니다.
    const roundList = Array.from(rounds.values())
    await prisma.$transaction([
      ...roundList.map(r => prisma.examRound.upsert({
        where: { category_round: { category: r.category, round: r.round } },
        update: {},
        create: { category: r.category, round: r.round, durationMin, passScore, subjectMin },
      })),
      prisma.examQuestion.deleteMany({
        where: { OR: roundList.map(r => ({ category: r.category, round: r.round })) },
      }),
      prisma.examQuestion.createMany({
        data: rows.map(r => ({
          category: r.category, round: r.round, subject: r.subject, number: r.number,
          content: r.content, choices: r.choices, answer: r.answer, explanation: r.explanation || null,
        })),
      }),
    ])
    await logAudit('EXAM_UPLOAD', auth.session.loginId, 'exam', { questions: rows.length, rounds: rounds.size })
    return NextResponse.json({ ok: true, questions: rows.length, rounds: rounds.size })
  } catch (e: any) {
    console.error('exam upload error:', e?.message)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
