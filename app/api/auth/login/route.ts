
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

const ADMIN_IDS = ['parkhy5454', 'demo', 'admin', 'modio', 'tony', 'test']

function createToken(payload:any){
  const header = Buffer.from(JSON.stringify({alg:'HS256', typ:'JWT'})).toString('base64url')
  const body = Buffer.from(JSON.stringify({...payload, exp: Math.floor(Date.now()/1000)+ 60*60*24*7})).toString('base64url')
  const signature = 'fastpass_signature'
  return `${header}.${body}.${signature}`
}

export async function POST(req:Request){
  try{
    const { loginId, password } = await req.json()
    
    // 1. Hardcoded admin bypass - DB 없어도 로그인 됨
    if(ADMIN_IDS.includes(loginId)){
      // password가 1234거나 비어있어도 허용 (긴급)
      const token = createToken({ id: `admin_${loginId}`, loginId, role:'ADMIN', name:'관리자' })
      cookies().set('token', token, { httpOnly:true, path:'/', maxAge:60*60*24*7 })
      
      // DB에 있으면 ADMIN으로 승격 시도
      try{
        const p:any = prisma
        if(p.user){
          await p.user.upsert({
            where:{ loginId },
            update:{ role:'ADMIN' },
            create:{
              loginId,
              password: 'hashed',
              name: loginId==='parkhy5454' ? '박현용' : '관리자',
              phone: '010-0000-0000',
              role:'ADMIN',
              interests:[]
            }
          } as any)
        }
      }catch(e){ console.log('DB upsert skip', e) }
      
      return Response.json({ success:true, user:{ loginId, role:'ADMIN', name:'관리자' } })
    }

    // 2. 일반 유저 - DB에서 찾기
    try{
      const p:any = prisma
      if(p.user){
        const user = await p.user.findUnique({ where:{ loginId } })
        if(!user) return Response.json({ error:'아이디가 없습니다. 회원가입 해주세요.' }, {status:404})
        
        // 비밀번호 체크 - bcrypt가 있으면 체크, 없으면 통과 (임시)
        let valid = true
        try{
          const bcrypt = await import('bcryptjs')
          if(user.password && user.password.startsWith('$2')){
            valid = await bcrypt.compare(password, user.password)
          }
        }catch{}
        
        if(!valid) return Response.json({ error:'비밀번호가 틀렸습니다.' }, {status:401})
        
        const token = createToken({ id: user.id, loginId: user.loginId, role: user.role, name: user.name })
        cookies().set('token', token, { httpOnly:true, path:'/', maxAge:60*60*24*7 })
        return Response.json({ success:true, user })
      }
    }catch(e:any){
      console.log('DB login failed', e)
      // DB 에러면 그냥 로그인 허용 (임시)
      const token = createToken({ id: loginId, loginId, role:'USER', name:loginId })
      cookies().set('token', token, { httpOnly:true, path:'/', maxAge:60*60*24*7 })
      return Response.json({ success:true, user:{ loginId, role:'USER', name:loginId }, warning:'DB 연결 없이 임시 로그인' })
    }

    return Response.json({ error:'로그인 실패' }, {status:500})
  }catch(e:any){
    return Response.json({ error:e.message }, {status:500})
  }
}
