
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
export async function POST(req: Request){
  try {
    const { loginId, password, name, phone, interests } = await req.json()
    if(!loginId || !password || !name) return Response.json({error:'필수 입력'}, {status:400})
    const exists = await prisma.user.findUnique({ where: { loginId } })
    if(exists) return Response.json({error:'이미 있는 아이디'}, {status:409})
    const hashed = await hashPassword(password)
    const user = await prisma.user.create({ data: { loginId, password: hashed, name, phone: phone||'', interests: interests||[] } })
    return Response.json({ok:true, id: user.id})
  } catch(e:any){ return Response.json({error: e.message}, {status:500}) }
}
