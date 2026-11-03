
import { cookies } from 'next/headers'

function isAdminId(loginId:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return id.includes('parkhy5454') || id==='admin' || id.includes('admin@') || id==='demo' || id==='modio' || id==='tony' || id==='test'
}

function decodeJwt(token:string){
  try{
    const parts = token.split('.')
    if(parts.length<2) return null
    const payload = parts[1]
    const json = Buffer.from(payload, 'base64url').toString('utf-8')
    return JSON.parse(json)
  }catch{ return null }
}

export async function GET(){
  try{
    const token = cookies().get('token')?.value
    if(!token) return Response.json({user:null})
    
    const payload:any = decodeJwt(token)
    if(!payload) return Response.json({user:null})
    
    try{
      const { prisma } = await import('@/lib/db')
      const p:any = prisma
      if(p.user){
        const user = await p.user.findUnique({ where:{ loginId: payload.loginId } } as any)
        if(user){
          // Auto promote if contains parkhy5454
          if(isAdminId(user.loginId) && user.role!=='ADMIN'){
            try{ await p.user.update({ where:{ loginId: user.loginId }, data:{ role:'ADMIN' } as any }) }catch{}
            user.role='ADMIN'
          }
          return Response.json({user})
        }
      }
    }catch{}
    
    return Response.json({user:{
      id: payload.id,
      loginId: payload.loginId,
      name: payload.name || payload.loginId,
      phone: '010-0000-0000',
      role: isAdminId(payload.loginId) ? 'ADMIN' : (payload.role || 'USER'),
      interests: ['전기기사'],
      createdAt: new Date().toISOString()
    }})
  }catch(e:any){
    return Response.json({user:null, error:e.message})
  }
}
