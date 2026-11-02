
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-123456')
export async function hashPassword(pw: string){ return bcrypt.hash(pw, 10) }
export async function verifyPassword(pw: string, hash: string){ return bcrypt.compare(pw, hash) }
export async function signJwt(payload: any){
  return await new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(secret)
}
export async function verifyJwt(token: string){
  try { const {payload} = await jwtVerify(token, secret); return payload } catch { return null }
}
export function setAuthCookie(token: string){
  return `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7*24*60*60}`
}
