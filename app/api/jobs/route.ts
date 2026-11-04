import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'
import { prisma as db } from '@/lib/db'

const prisma = db as any
const TYPES = ['구인', '구직']

// 수정 가능한 항목만 골라 씁니다. 구분(구인/구직)과 결제 정보는 등록 때 정해지고 바뀌지 않습니다.
function pickFields(body: any) {
  const s = (v: any) => (typeof v === 'string' ? v.trim() : '')
  return {
    title: s(body.title),
    company: s(body.company),
    location: s(body.location) || '서울',
    salary: s(body.salary) || '협의',
    cert: s(body.cert) || '전기기사',
    description: s(body.description),
    contact: s(body.contact),
    files: Array.isArray(body.files) ? body.files : [],
  }
}

function canEdit(session: any, job: any) {
  return session.role === 'ADMIN' || job.userId === session.id
}

// 목록과 상세 조회는 누구나 볼 수 있습니다. 연락처는 화면에서 "연락처 보기"를 눌러야 나옵니다.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const type = searchParams.get('type')
  try {
    if (id) {
      const job = await prisma.job.findUnique({ where: { id } })
      if (!job) return NextResponse.json({ error: '공고 없음' }, { status: 404 })
      return NextResponse.json({ job })
    }
    const where = type && TYPES.includes(type) ? { type } : {}
    const jobs = await prisma.job.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ jobs })
  } catch (e: any) {
    console.error('jobs GET error:', e?.message)
    return NextResponse.json({ error: '목록을 불러오지 못했습니다' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const body = await req.json().catch(() => ({}))
    if (!TYPES.includes(body.type)) return NextResponse.json({ error: '구인 또는 구직을 선택하세요' }, { status: 400 })
    const f = pickFields(body)
    if (!f.title || !f.company) return NextResponse.json({ error: '제목, 회사(이름)는 필수입니다' }, { status: 400 })
    const job = await prisma.job.create({
      data: {
        type: body.type,
        ...f,
        userId: auth.session.id,
        userLoginId: auth.session.loginId,
        // 결제 연동 전까지는 등록을 결제 완료로 기록합니다. 구인 결제는 토스 승인 후 연결합니다.
        paid: true,
        paidAmount: 0,
        hireConfirmed: false,
      },
    })
    return NextResponse.json({ ok: true, job })
  } catch (e: any) {
    console.error('jobs POST error:', e?.message)
    return NextResponse.json({ error: '등록 실패' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const body = await req.json().catch(() => ({}))
    if (!body.id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })
    const job = await prisma.job.findUnique({ where: { id: body.id } })
    if (!job) return NextResponse.json({ error: '공고 없음' }, { status: 404 })
    if (!canEdit(auth.session, job)) return NextResponse.json({ error: '본인 공고만 수정할 수 있습니다' }, { status: 403 })
    const f = pickFields(body)
    if (!f.title || !f.company) return NextResponse.json({ error: '제목, 회사(이름)는 필수입니다' }, { status: 400 })
    const updated = await prisma.job.update({ where: { id: body.id }, data: f })
    return NextResponse.json({ ok: true, job: updated })
  } catch (e: any) {
    console.error('jobs PUT error:', e?.message)
    return NextResponse.json({ error: '수정 실패' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })
    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) return NextResponse.json({ error: '공고 없음' }, { status: 404 })
    if (!canEdit(auth.session, job)) return NextResponse.json({ error: '본인 공고만 삭제할 수 있습니다' }, { status: 403 })
    await prisma.job.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('jobs DELETE error:', e?.message)
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}
