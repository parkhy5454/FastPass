// 실제 PG(토스 등) 검증 연동 전까지 결제 확인은 기본적으로 거부합니다.
// 테스트 환경에서만 ALLOW_MOCK_PAYMENTS=true 로 열어 두세요. 운영 환경에는 설정하지 마세요.
export function mockPaymentsEnabled() {
  return process.env.ALLOW_MOCK_PAYMENTS === 'true'
}
export const PAYMENT_DISABLED_MESSAGE = '결제 검증(PG) 연동 전입니다. 현재 결제는 처리할 수 없습니다.'
