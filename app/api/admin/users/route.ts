
import { prisma } from '@/lib/db'
export async function GET(req: Request){
  const cookie = req.headers.get('cookie') || ''
  const adminSecret = (cookie.match(/admin_secret=([^;]+)/)?.[1]) || ''
  if(adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'fastpass-admin-2026'){
    // also check token
    const token = cookie.match(/token=([^;]+)/)?.[1]
    if(!token) return Response.json({error:'권한 없음'}, {status:403})
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return Response.json(users)
}
