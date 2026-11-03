
import { cookies } from 'next/headers'

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
    
    // DB에서 최신 정보 가져오기 시도
    try{
      const { prisma } = await import('@/lib/db')
      const p:any = prisma
      if(p.user){
        const user = await p.user.findUnique({ where:{ loginId: payload.loginId } } as any)
        if(user) return Response.json({user})
      }
    }catch{}
    
    // DB 없어도 payload로 반환
    return Response.json({user:{
      id: payload.id,
      loginId: payload.loginId,
      name: payload.name || payload.loginId,
      phone: '010-0000-0000',
      role: payload.role || 'USER',
      interests: ['전기기사'],
      createdAt: new Date().toISOString()
    }})
  }catch(e:any){
    return Response.json({user:null, error:e.message})
  }
}
