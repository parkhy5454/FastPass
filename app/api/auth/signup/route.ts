import { prisma } from '@/lib/db'
import { hashPassword, signJwt, setAuthCookie } from '@/lib/auth'
export async function POST(req: Request) {
  const { loginId, password, name, phone, interests } = await req.json()
  if (!loginId || !password || !name || !phone) return Response.json({error:'필수값 누락'}, {status:400})
  if (password.length < 8) return Response.json({error:'비번 8자 이상'}, {status:400})
  const exists = await prisma.user.findUnique({ where: { loginId } })
  if (exists) return Response.json({error:'이미 존재'}, {status:409})
  const hashed = await hashPassword(password)
  const user = await prisma.user.create({ data: { loginId, password: hashed, name, phone, interests: interests||[], verified: false } })
  const token = await signJwt({ id: user.id, loginId: user.loginId, role: user.role, name: user.name })
  const cookie = setAuthCookie(token)
  return new Response(JSON.stringify({ user }), { headers: { 'Set-Cookie': cookie, 'Content-Type':'application/json' } })
}
