
import { NextRequest, NextResponse } from 'next/server'
const COUPONS: Record<string, {discount:number, validUntil:string}> = {
  'WELCOME10': {discount:10, validUntil:'2026-12-31'},
  'FRIEND20': {discount:20, validUntil:'2026-12-31'},
  'FIRST50': {discount:50, validUntil:'2026-06-30'},
  'ELECTRIC15': {discount:15, validUntil:'2026-12-31'},
  'PASS2026': {discount:25, validUntil:'2026-12-31'},
  'STUDY30': {discount:30, validUntil:'2026-03-31'},
}
export async function POST(req: NextRequest){
  try{
    const {code} = await req.json()
    const coupon = COUPONS[code?.toUpperCase()]
    if(!coupon) return NextResponse.json({valid:false, message:'존재하지 않는 쿠폰입니다'})
    const now = new Date(); const until = new Date(coupon.validUntil)
    if(now > until) return NextResponse.json({valid:false, message:'만료된 쿠폰입니다'})
    return NextResponse.json({valid:true, discount:coupon.discount, code: code.toUpperCase()})
  }catch(e:any){ return NextResponse.json({valid:false, message:'쿠폰 확인 실패'}, {status:500}) }
}
export async function GET(){ return NextResponse.json({coupons: Object.keys(COUPONS)}) }
