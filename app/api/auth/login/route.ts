
import { prisma } from '@/lib/db'
import { verifyPassword, signJwt } from '@/lib/auth'
export async function POST(req: Request){
  const { loginId, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { loginId } })
  if(!user) return Response.json({error:'아이디 없음'}, {status:404})
  const ok = await verifyPassword(password, user.password)
  if(!ok) return Response.json({error:'비밀번호 틀림'}, {status:401})
  const token = await signJwt({ id: user.id, loginId: user.loginId, role: user.role })
  return new Response(JSON.stringify({ok:true}), { headers: { 'Set-Cookie': `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`, 'Content-Type':'application/json' } })
}
