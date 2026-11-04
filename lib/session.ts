import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyJWT, isAdmin } from './security'

// 현재 요청의 로그인 정보를 서명 검증해서 돌려줍니다. 없거나 위조/만료면 null.
export function getSession(): Record<string, any> | null {
  const token = cookies().get('token')?.value
  if (!token) return null
  return verifyJWT(token)
}

type Guard = { session: Record<string, any> } | { response: NextResponse }

export function requireUser(): Guard {
  const session = getSession()
  if (!session) return { response: NextResponse.json({ error: '로그인 필요' }, { status: 401 }) }
  return { session }
}

export function requireAdmin(): Guard {
  const session = getSession()
  if (!session) return { response: NextResponse.json({ error: '인증 필요' }, { status: 401 }) }
  if (!isAdmin(session)) return { response: NextResponse.json({ error: '관리자 권한 필요' }, { status: 403 }) }
  return { session }
}
