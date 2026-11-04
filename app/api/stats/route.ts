import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

// 로그인하지 않은 사용자에게는 기본 샘플 값을 보여 줍니다 (기존 동작 유지)
const SAMPLE = { todaySolved: 0, goal: 50, streak: 0, accuracy: 0, totalSolved: 0, weakCategory: '', weakAccuracy: 0 }

export async function GET() {
  const session = getSession()
  if (!session) return NextResponse.json(SAMPLE)
  try {
    const p: any = prisma
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const totalSolved = await p.wrongNote.count({ where: { userId: session.id } })
    const todaySolved = await p.wrongNote.count({ where: { userId: session.id, createdAt: { gte: today } } })
    return NextResponse.json({ ...SAMPLE, todaySolved, totalSolved })
  } catch {
    return NextResponse.json(SAMPLE)
  }
}
