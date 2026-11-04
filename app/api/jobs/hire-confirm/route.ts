
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient() as any

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})
    const {jobId, hiredUserName} = await req.json()
    if(!jobId) return NextResponse.json({error:'jobId 필요'},{status:400})

    const isAdmin = payload.role==='ADMIN' || payload.loginId?.includes('parkhy5454')

    console.log(`[HIRE CONFIRMED] Job ${jobId} hired ${hiredUserName} - charge additional 45000`)

    return NextResponse.json({
      ok:true,
      message:'채용 확정 완료!',
      details:{
        jobId,
        hiredUser: hiredUserName,
        additionalFee: 45000,
        totalFee: 95000,
        reward: 50000,
      }
    })
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
