import { requireAdmin } from '@/lib/session'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id 필요' }, { status: 400 })
    await (prisma as any).flipbook.delete({ where: { id } })
    await logAudit('PDF_DELETE', auth.session.loginId, id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}
