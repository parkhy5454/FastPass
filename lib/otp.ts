import { authenticator } from 'otplib'
export function generateOtpSecret() { return authenticator.generateSecret() }
export function verifyOtp(token: string, secret: string) {
  return authenticator.verify({ token, secret })
}
export async function generateQrCode(secret: string, user: string) {
  // QR 없이 URI만 반환 (qrcode 라이브러리 없이)
  const otpauth = authenticator.keyuri(user, '전기패스 Admin', secret)
  return otpauth
}
