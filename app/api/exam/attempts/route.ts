import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 내 응시 기록 목록
export async function GET(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const category = req.nextUrl.searchParams.get('category') || undefined
    const list = await prisma.examAttempt.findMany({
      where: { userId: auth.session.id, ...(category ? { category } : {}) },
      orderBy: { startedAt: 'desc' },
      take: 100,
      select: { id: true, category: true, round: true, startedAt: true, submittedAt: true, total: true, passed: true, timedOut: true },
    })
    return NextResponse.json({ attempts: list })
  } catch (e: any) {
    console.error('exam attempts error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}
