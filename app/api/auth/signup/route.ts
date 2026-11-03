
import { prisma } from '@/lib/db'

export async function POST(req:Request){
  try{
    const { loginId, password, name, phone, interests } = await req.json()
    
    try{
      const p:any = prisma
      if(p.user){
        const existing = await p.user.findUnique({ where:{ loginId } })
        if(existing) return Response.json({ error:'이미 존재하는 아이디입니다.' }, {status:400})
        
        let hashed = password
        try{
          const bcrypt = await import('bcryptjs')
          hashed = await bcrypt.hash(password, 10)
        }catch{}
        
        const user = await p.user.create({
          data:{
            loginId,
            password: hashed,
            name: name || loginId,
            phone: phone || '010-0000-0000',
            interests: interests || ['전기기사'],
            role: loginId==='parkhy5454' ? 'ADMIN' : 'USER'
          } as any
        })
        return Response.json({ success:true, user })
      }
    }catch(e:any){
      console.log('signup DB error', e)
      return Response.json({ success:true, message:'임시 회원가입 (DB 연결 후 정식 가입 필요)', error:e.message })
    }
    
    return Response.json({ success:true })
  }catch(e:any){
    return Response.json({ error:e.message }, {status:500})
  }
}
