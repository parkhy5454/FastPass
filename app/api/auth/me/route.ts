
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

export async function GET(req: NextRequest){
  try{
    const cookieStore = cookies()
    let token = cookieStore.get('token')?.value

    if(!token){
      const authHeader = req.headers.get('authorization')
      if(authHeader?.startsWith('Bearer ')){
        token = authHeader.substring(7)
      }
    }

    if(!token){
      return NextResponse.json({user:null, reason:'no_token'}, {status:200})
    }

    const payload = verifyJWT(token)

    if(!payload){
      return NextResponse.json({user:null, reason:'invalid_token'}, {status:200})
    }

    try{
      const user = await prisma.user.findUnique({where:{id: payload.id}})
      if(user){
        return NextResponse.json({user:{
          id: user.id,
          loginId: user.loginId,
          name: user.name,
          role: user.role,
          interests: user.interests||'전기',
          email: user.email,
        }})
      }
    }catch(e){ console.log('DB error in me', e) }

    return NextResponse.json({user:{
      id: payload.id,
      loginId: payload.loginId||payload.email||'user',
      name: payload.name||payload.loginId||'사용자',
      role: payload.role||'USER',
      interests: payload.interests||'전기',
    }})

  }catch(e:any){
    console.log('me API error', e.message)
    return NextResponse.json({user:null, error:e.message}, {status:200})
  }
}
