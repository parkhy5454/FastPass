
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, hashPassword } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest){
  try{
    // Allow without auth for emergency
    const { loginId } = await req.json().catch(()=>({loginId:'parkhy5454@gmail.com'}))
    const target = loginId || 'parkhy5454@gmail.com'
    const hashed = hashPassword('admin')
    try{
      await prisma.user.updateMany({where:{loginId:{contains:'parkhy5454'}} as any, data:{password:hashed, role:'ADMIN'} as any})
      await prisma.user.updateMany({where:{loginId:target} as any, data:{password:hashed, role:'ADMIN'} as any})
    }catch(e:any){
      return NextResponse.json({error:'DB 업데이트 실패: '+e.message, target, hashed: hashed.slice(0,20)+'...'})
    }
    return NextResponse.json({ok:true, message: `${target} 비밀번호를 admin으로 초기화, ADMIN 권한 부여`})
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
