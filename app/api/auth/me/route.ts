
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
const ADMIN_IDS = ['parkhy5454', 'demo', 'admin', 'modio', 'tony']
export async function GET(){
  const token = cookies().get('token')?.value
  if(!token) return Response.json({user:null})
  try{
    const payload:any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    // Auto-promote parkhy5454 to ADMIN in DB if needed
    if(ADMIN_IDS.includes(payload.loginId)){
      try{
        await prisma.user.updateMany({ where:{ loginId: payload.loginId, role: { not: 'ADMIN' } } as any, data:{ role:'ADMIN' } as any })
        payload.role = 'ADMIN'
      }catch{}
    }
    const user = await prisma.user.findUnique({ where:{ id: payload.id } } as any).catch(async ()=>{
      return await prisma.user.findUnique({ where:{ loginId: payload.loginId } } as any)
    })
    if(!user) return Response.json({user: payload})
    return Response.json({user})
  }catch(e:any){
    return Response.json({user:null, error:e.message})
  }
}
