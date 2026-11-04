import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/session'

// 채용 확정 처리. 공고 소유권 확인과 실제 청구는 Job 모델 + 결제 연동 후 구현해야 합니다.
// 지금은 로그인 사용자만 호출할 수 있고, 실제 청구/포인트 지급은 하지 않습니다.
export async function POST(req: NextRequest) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const { jobId, hiredUserName } = await req.json().catch(() => ({}))
  if (!jobId) return NextResponse.json({ error: 'jobId 필요' }, { status: 400 })
  console.log(`[HIRE CONFIRM] job=${jobId} by=${auth.session.loginId} hired=${hiredUserName}`)
  return NextResponse.json({
    ok: true,
    message: '채용 확정 기록 완료 (청구는 결제 연동 후 처리)',
    details: { jobId, hiredUser: hiredUserName, additionalFee: 45000, reward: 50000, billed: false },
  })
}
