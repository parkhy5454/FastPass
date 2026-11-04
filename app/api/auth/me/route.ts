import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

// 현재 로그인 사용자 정보. 서명이 검증된 토큰만 인정합니다.
export async function GET() {
  const payload = getSession()
  if (!payload) return NextResponse.json({ user: null })
  try {
    const user: any = await (prisma as any).user.findUnique({ where: { id: payload.id } })
    if (user) {
      return NextResponse.json({
        user: {
          id: user.id,
          loginId: user.loginId,
          name: user.name,
          role: user.role,
          interests: user.interests?.length ? user.interests : ['전기'],
          email: user.email,
          points: user.points ?? 0,
          plan: user.plan ?? 'FREE',
        },
      })
    }
  } catch (e) {
    console.error('me: DB error', e)
  }
  // DB 조회 실패 시 토큰 정보로 응답 (토큰은 서명 검증됨)
  return NextResponse.json({
    user: {
      id: payload.id,
      loginId: payload.loginId,
      name: payload.name || payload.loginId,
      role: payload.role || 'USER',
      interests: payload.interests || ['전기'],
      email: payload.email,
    },
  })
}
