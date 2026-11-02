
import { verifyJwt } from '@/lib/auth'
import { prisma } from '@/lib/db'
export async function GET(req: Request){
  const cookie = req.headers.get('cookie') || ''
  const token = cookie.match(/token=([^;]+)/)?.[1]
  if(!token) return Response.json({user:null})
  const payload:any = await verifyJwt(token)
  if(!payload) return Response.json({user:null})
  const user = await prisma.user.findUnique({ where: { id: payload.id }, select: { id:true, loginId:true, name:true, phone:true, interests:true, role:true, createdAt:true } })
  return Response.json({user})
}
