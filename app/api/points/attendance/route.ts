import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any
const ATTENDANCE_POINTS = 100
const KST = 9 * 60 * 60 * 1000

// 출석 포인트: 하루(한국 시간) 한 번, 100P
export async function POST() {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const today = new Date(Date.now() + KST).toISOString().slice(0, 10)
    const result = await prisma.user.updateMany({
      where: { id: auth.session.id, NOT: { lastAttendance: today } },
      data: { points: { increment: ATTENDANCE_POINTS }, lastAttendance: today, pointsUpdatedAt: new Date() },
    })
    return NextResponse.json({ ok: true, awarded: result.count === 1 ? ATTENDANCE_POINTS : 0 })
  } catch (e: any) {
    console.error('attendance error:', e?.message)
    return NextResponse.json({ error: '출석 처리 실패' }, { status: 500 })
  }
}
