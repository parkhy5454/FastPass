
import { cookies } from 'next/headers'
function isAdminId(id:string){ return id && (id.toLowerCase().includes('parkhy5454') || id.toLowerCase().includes('parkhy')) }
function decodeJwt(token:string){ try{ const p=token.split('.')[1]; return JSON.parse(Buffer.from(p,'base64url').toString('utf-8')) }catch{ return null } }
export async function GET(){
  const token = cookies().get('token')?.value
  if(!token) return Response.json({user:null})
  const payload:any = decodeJwt(token)
  if(!payload) return Response.json({user:null})
  try{
    const { prisma } = await import('@/lib/db')
    const p:any = prisma
    const user = await p.user.findUnique({ where:{ loginId: payload.loginId } })
    if(user){ if(isAdminId(user.loginId) && user.role!=='ADMIN'){ try{ await p.user.update({ where:{ loginId: user.loginId }, data:{ role:'ADMIN' } }); user.role='ADMIN' }catch{} } return Response.json({user}) }
  }catch{}
  return Response.json({user:{ id: payload.id, loginId: payload.loginId, name: payload.name || payload.loginId, phone:'010-0000-0000', role: isAdminId(payload.loginId)?'ADMIN':(payload.role||'USER'), interests:['전기기사'], createdAt:new Date().toISOString() }})
}
