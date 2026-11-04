import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const purchases = await (prisma as any).purchase.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    return NextResponse.json(purchases)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
