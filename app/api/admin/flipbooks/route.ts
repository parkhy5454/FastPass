import { prisma } from '@/lib/db'

// 플립북 목록. PDF 주소는 빼고, 파일 유무만 알려 줍니다. 공개된 자료만 보입니다.
function toPublic(f: any) {
  const { pdfUrl, ...rest } = f
  return { ...rest, hasPdf: !!pdfUrl }
}

export async function GET() {
  try {
    const p: any = prisma
    const fb = await p.flipbook.findMany({ where: { isPublished: true }, orderBy: { createdAt: 'desc' }, take: 500 })
    return Response.json(fb.map(toPublic))
  } catch (e: any) {
    console.error('flipbooks GET findMany error:', e?.message)
    try {
      const p: any = prisma
      const fb = await p.$queryRaw`SELECT * FROM "Flipbook" WHERE "isPublished" = true ORDER BY "createdAt" DESC LIMIT 500`
      return Response.json(fb.map(toPublic))
    } catch (e2: any) {
      console.error('flipbooks GET raw error:', e2?.message)
      return Response.json([])
    }
  }
}
