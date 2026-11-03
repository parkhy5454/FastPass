
import { prisma } from '@/lib/db'
export async function POST(req:Request){
  try{
    const { loginId } = await req.json()
    const p:any = prisma
    if(!p.user) return Response.json({ error:'DB 연결 안됨' }, {status:500})
    
    const user = await p.user.update({
      where:{ loginId },
      data:{ role:'ADMIN' }
    })
    return Response.json({ success:true, message:`${loginId}가 ADMIN으로 승격됨`, user })
  }catch(e:any){
    return Response.json({ success:false, error:e.message }, {status:500})
  }
}

export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const loginId = searchParams.get('loginId') || 'parkhy5454@gmail.com'
  try{
    const p:any = prisma
    const user = await p.user.update({
      where:{ loginId },
      data:{ role:'ADMIN' }
    })
    return Response.json({ success:true, message:`${loginId} ADMIN 승격 완료!`, user })
  }catch(e:any){
    return Response.json({ error:e.message, hint:`Neon SQL에서 실행: UPDATE "User" SET "role"='ADMIN' WHERE "loginId"='${loginId}';` })
  }
}
