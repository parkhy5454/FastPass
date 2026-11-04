import { prisma } from '@/lib/db'

// 플립북 목록. 실패 시 원인을 서버 로그에 남기고 빈 목록을 돌려줍니다.
export async function GET() {
  try {
    const p: any = prisma
    const fb = await p.flipbook.findMany({ orderBy: { createdAt: 'desc' }, take: 500 })
    return Response.json(fb)
  } catch (e: any) {
    console.error('flipbooks GET findMany error:', e?.message)
    try {
      const p: any = prisma
      const fb = await p.$queryRaw`SELECT * FROM "Flipbook" ORDER BY "createdAt" DESC LIMIT 500`
      return Response.json(fb)
    } catch (e2: any) {
      console.error('flipbooks GET raw error:', e2?.message)
      return Response.json([])
    }
  }
}
