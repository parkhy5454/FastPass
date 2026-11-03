
import { prisma } from '@/lib/db'
function canSelfPromote(id:string){
  const s = id.toLowerCase()
  return s.includes('parkhy5454') || s.includes('parkhy') || s==='admin' || s==='demo'
}
export async function POST(req:Request){
  try{
    const { loginId } = await req.json()
    if(!canSelfPromote(loginId)){
      return Response.json({ error:'배포자 계정만 관리자로 승격 가능합니다. parkhy5454 계정으로 로그인하세요.' }, {status:403})
    }
    const p:any = prisma
    const user = await p.user.update({ where:{ loginId }, data:{ role:'ADMIN' } })
    return Response.json({ success:true, user })
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const loginId = searchParams.get('loginId') || ''
  if(!canSelfPromote(loginId)){
    return Response.json({ error:'배포자 계정만 가능합니다.' }, {status:403})
  }
  try{
    const p:any = prisma
    const user = await p.user.update({ where:{ loginId }, data:{ role:'ADMIN' } })
    return Response.json({ success:true, message:`${loginId} ADMIN 승격 완료`, user })
  }catch(e:any){ return Response.json({ error:e.message }, {status:500}) }
}
