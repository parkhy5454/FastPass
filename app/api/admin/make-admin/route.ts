
import { prisma } from '@/lib/db'
export async function POST(req:Request){
  try{
    const { loginId } = await req.json()
    const p:any = prisma
    const user = await p.user.update({ where:{ loginId }, data:{ role:'ADMIN' } })
    return Response.json({ success:true, user })
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const loginId = searchParams.get('loginId') || 'parkhy5454@gmail.com'
  try{
    const p:any = prisma
    const user = await p.user.update({ where:{ loginId }, data:{ role:'ADMIN' } })
    return Response.json({ success:true, message:`${loginId} ADMIN 승격 완료`, user })
  }catch(e:any){ return Response.json({ error:e.message }) }
}
