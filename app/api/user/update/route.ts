
import { prisma } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'
export async function POST(req: Request){
  const cookie = req.headers.get('cookie') || ''
  const token = cookie.match(/token=([^;]+)/)?.[1]
  if(!token) return Response.json({error:'로그인 필요'}, {status:401})
  const payload:any = await verifyJwt(token)
  if(!payload) return Response.json({error:'토큰 만료'}, {status:401})
  const { name, phone, interests } = await req.json()
  const user = await prisma.user.update({ where: { id: payload.id }, data: { name, phone, interests } })
  return Response.json({ok:true, user})
}
