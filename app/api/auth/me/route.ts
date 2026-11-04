
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { prisma } from '@/lib/prisma'

export async function GET(){
  try{
    const token = cookies().get('token')?.value
    if(!token){
      return NextResponse.json({user:null},{status:401})
    }

    const payload = verifyJWT(token)
    if(!payload){
      const res = NextResponse.json({user:null},{status:401})
      res.cookies.set('token', '', {httpOnly:true, secure: process.env.NODE_ENV==='production', sameSite:'strict', maxAge:0, path:'/'})
      return res
    }

    const user = await prisma.user.findUnique({where:{id: payload.id}}).catch(()=>null) as any
    if(!user){
      return NextResponse.json({user:null},{status:401})
    }

    return NextResponse.json({
      user:{
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        role: user.role,
        points: user.points||0,
        interests: user.interests||[],
        phone: user.phone,
        createdAt: user.createdAt
      }
    })
  }catch(e:any){
    return NextResponse.json({user:null},{status:401})
  }
}
