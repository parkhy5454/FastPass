import { requireAdmin } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const { id, name } = await req.json()
    const p: any = prisma
    // 파라미터 바인딩을 쓰는 태그드 템플릿이므로 SQL 주입 위험 없음
    await p.$queryRaw`DELETE FROM "Category" WHERE id = ${id} OR name = ${name}`
    await p.$queryRaw`UPDATE "Flipbook" SET category = '기타' WHERE category = ${name}`
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}
