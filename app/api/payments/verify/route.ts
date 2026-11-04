
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'

const VALID_PRICES = [9900, 59900, 149000, 4900, 19900, 2900, 99000, 19900, 4950, 2995]
const recentPayments = new Set<string>()

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})
    const {amount, productId, idempotencyKey, pointsUsed, totalPrice} = await req.json()

    // 30% 포인트 검증
    if(pointsUsed && totalPrice){
      const maxPoints = Math.floor(totalPrice * 0.3)
      if(pointsUsed > maxPoints){
        return NextResponse.json({error:`포인트는 최대 30%(${maxPoints}P)만 사용 가능`},{status:400})
      }
    }

    if(recentPayments.has(idempotencyKey)){
      return NextResponse.json({error:'이미 처리된 결제입니다'},{status:409})
    }

    recentPayments.add(idempotencyKey)
    setTimeout(()=> recentPayments.delete(idempotencyKey), 60*60*1000)

    // Mock - 실제로는 Toss/KakaoPay 검증
    console.log(`[PAYMENT] ${payload.id} paid ${amount} for ${productId}`)

    return NextResponse.json({ok:true, verified:true, amount, productId})
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
