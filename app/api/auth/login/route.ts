
import { prisma } from '@/lib/db'
import { verifyPassword, signJwt, setAuthCookie } from '@/lib/auth'
export async function POST(req: Request) {
  const { loginId, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { loginId } })
  if (!user) return Response.json({error:'아이디 없음'}, {status:404})
  const ok = await verifyPassword(password, user.password)
  if (!ok) return Response.json({error:'비번 틀림'}, {status:401})
  const token = await signJwt({ id: user.id, loginId: user.loginId, role: user.role, name: user.name, phone: user.phone })
  const cookie = setAuthCookie(token)
  return new Response(JSON.stringify({ user }), { headers: { 'Set-Cookie': cookie, 'Content-Type':'application/json' } })
}
