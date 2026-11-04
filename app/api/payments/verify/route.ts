
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { VALID_PRICES } from '@/lib/payment-verify'
import { logAudit } from '@/lib/audit'

const recentPayments = new Set<string>()

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})

    const {amount, productId, idempotencyKey, paymentMethod} = await req.json()

    // 1. 금액 검증
    if(!VALID_PRICES.includes(amount)){
      await logAudit('PAYMENT', payload.id, payload.id, {error:'Invalid amount', amount, productId, ip: req.headers.get('x-forwarded-for')})
      return NextResponse.json({error:`잘못된 결제 금액입니다: ${amount}`},{status:400})
    }

    // 2. 중복 결제 방지
    if(recentPayments.has(idempotencyKey)){
      return NextResponse.json({error:'이미 처리된 결제입니다'},{status:409})
    }

    // 3. 포인트 사용 검증 (최대 30%)
    const {pointsUsed, totalPrice} = req.json() as any
    // 실제로는 DB에서 포인트 확인 필요

    // 4. 웹훅 검증 (실제로는 토스/카카오페이 웹훅 확인)
    // 여기서는 mock
    recentPayments.add(idempotencyKey)
    setTimeout(()=> recentPayments.delete(idempotencyKey), 60*60*1000) // 1시간 후 제거

    await logAudit('PAYMENT', payload.id, productId, {amount, paymentMethod, idempotencyKey})

    return NextResponse.json({ok:true, verified:true, amount, productId})

  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
