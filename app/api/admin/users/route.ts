
import { prisma } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'
export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/token=([^;]+)/)
  const token = match ? match[1] : req.headers.get('authorization')?.replace('Bearer ','')
  const payload:any = token ? await verifyJwt(token) : null
  if (payload?.role !== 'ADMIN') return Response.json({error:'권한 없음'}, {status:403})
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return Response.json(users)
}
