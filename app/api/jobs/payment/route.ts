
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'

const JOB_PRICES: Record<string, number> = {
  '1건': 50000,
  '5건': 200000,
  '무제한': 300000,
}

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})
    const {packageType, amount} = await req.json()
    const validAmount = JOB_PRICES[packageType]
    if(!validAmount || amount!==validAmount){
      return NextResponse.json({error:`잘못된 금액. ${packageType}은 ${validAmount}원`},{status:400})
    }
    console.log(`[JOB PAYMENT] ${payload.id} paid ${amount} for ${packageType}`)
    return NextResponse.json({
      ok:true,
      verified:true,
      packageType,
      amount,
      paymentId: `job_${Date.now()}`,
      expiresAt: new Date(Date.now()+30*24*60*60*1000).toISOString(),
    })
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
