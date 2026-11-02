
import { authenticator } from 'otplib'
export function generateOtpSecret(){ return authenticator.generateSecret() }
export function verifyOtp(token: string, secret: string){ return authenticator.verify({token, secret}) }
export async function generateQrCode(secret: string, user: string){
  return authenticator.keyuri(user, '전기패스 Admin', secret)
}
