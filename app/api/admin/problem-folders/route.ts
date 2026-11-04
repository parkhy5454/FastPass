import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try {
    const folders = await (prisma as any).problemFolder.findMany({ orderBy: { createdAt: 'asc' } }).catch(() => [])
    return NextResponse.json(folders)
  } catch {
    return NextResponse.json([])
  }
}
