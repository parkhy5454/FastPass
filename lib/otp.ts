import { authenticator } from 'otplib'
import QRCode from 'qrcode'
export function generateOtpSecret() { return authenticator.generateSecret() }
export async function generateQrCode(secret: string, user: string) {
  const otpauth = authenticator.keyuri(user, '전기패스 Admin', secret)
  return await QRCode.toDataURL(otpauth)
}
export function verifyOtp(token: string, secret: string) {
  return authenticator.verify({ token, secret })
}
