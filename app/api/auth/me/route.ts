
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

const ADMIN_IDS = ['parkhy5454', 'demo', 'admin', 'modio', 'tony']

function decodeJwt(token:string){
  try{
    const payload = token.split('.')[1]
    const json = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(json)
  }catch{ return null }
}

export async function GET(){
  const token = cookies().get('token')?.value
  if(!token) return Response.json({user:null})
  try{
    const payload:any = decodeJwt(token)
    if(!payload) return Response.json({user:null})
    
    // Auto-promote ADMIN_IDS to ADMIN
    if(ADMIN_IDS.includes(payload.loginId)){
      try{
        await prisma.user.updateMany({ 
          where:{ loginId: payload.loginId } as any, 
          data:{ role:'ADMIN' } as any 
        })
      }catch(e){ console.log('auto promote failed', e) }
    }
    
    let user = null
    try{
      user = await prisma.user.findUnique({ where:{ id: payload.id } } as any)
    }catch{}
    if(!user){
      try{
        user = await prisma.user.findUnique({ where:{ loginId: payload.loginId } } as any)
      }catch{}
    }
    if(!user) return Response.json({user: payload})
    return Response.json({user})
  }catch(e:any){
    return Response.json({user:null, error:e.message})
  }
}
