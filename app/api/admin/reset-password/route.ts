
import { prisma } from '@/lib/db'
export async function POST(req:Request){
  try{
    const { loginId, newPassword } = await req.json()
    const p:any = prisma
    let hashed = newPassword
    try{ const bcrypt = await import('bcryptjs'); hashed = await bcrypt.hash(newPassword, 10) }catch{}
    const user = await p.user.update({ where:{ loginId }, data:{ password: hashed } })
    return Response.json({ success:true, loginId: user.loginId })
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
