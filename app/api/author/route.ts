import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any

// 내 저자 정보 조회
export async function GET() {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const author = await prisma.author.findUnique({ where: { userId: auth.session.id } })
    return NextResponse.json({ author: author ? { displayName: author.displayName, isBusiness: author.isBusiness, status: author.status } : null })
  } catch (e: any) {
    console.error('author GET error:', e?.message)
    return NextResponse.json({ error: '조회 실패' }, { status: 500 })
  }
}

// 저자 신청 (관리자 승인 후 교재 연결 가능). 정산 계좌는 관리자 화면에서 따로 받습니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const b = await req.json().catch(() => ({}))
    const displayName = typeof b.displayName === 'string' ? b.displayName.trim() : ''
    if (displayName.length < 2 || displayName.length > 30) return NextResponse.json({ error: '저자명은 2~30자로 입력하세요' }, { status: 400 })
    const exists = await prisma.author.findUnique({ where: { userId: auth.session.id } })
    if (exists) return NextResponse.json({ error: '이미 신청한 저자입니다' }, { status: 409 })
    await prisma.author.create({
      data: { userId: auth.session.id, displayName, isBusiness: !!b.isBusiness, status: '신청' },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('author POST error:', e?.message)
    return NextResponse.json({ error: '신청 실패' }, { status: 500 })
  }
}
