import { NextRequest, NextResponse } from 'next/server'
// 쿠폰 목록은 더 이상 공개하지 않습니다 (코드 목록 노출 방지)
const COUPONS: Record<string, { discount: number; validUntil: string }> = {
  'WELCOME10': { discount: 10, validUntil: '2026-12-31' },
  'FRIEND20': { discount: 20, validUntil: '2026-12-31' },
  'ELECTRIC15': { discount: 15, validUntil: '2026-12-31' },
  'PASS2026': { discount: 25, validUntil: '2026-12-31' },
}
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json().catch(() => ({}))
    const key = typeof code === 'string' ? code.trim().toUpperCase() : ''
    const coupon = COUPONS[key]
    if (!coupon) return NextResponse.json({ valid: false, message: '존재하지 않는 쿠폰입니다' })
    if (new Date() > new Date(coupon.validUntil)) return NextResponse.json({ valid: false, message: '만료된 쿠폰입니다' })
    return NextResponse.json({ valid: true, discount: coupon.discount, code: key })
  } catch {
    return NextResponse.json({ valid: false, message: '쿠폰 확인 실패' }, { status: 500 })
  }
}
