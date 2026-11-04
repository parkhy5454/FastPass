import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { getAuditLogs } from '@/lib/audit'

export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  const logs = await getAuditLogs(100)
  return NextResponse.json({ logs })
}
