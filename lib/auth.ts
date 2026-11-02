import bcrypt from 'bcryptjs'
import * as jose from 'jose'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-this-32-chars-min-secret-key!')
export async function hashPassword(pw: string) { return bcrypt.hash(pw, 12) }
export async function verifyPassword(pw: string, hash: string) { return bcrypt.compare(pw, hash) }
export async function signJwt(payload: any) {
  return await new jose.SignJWT(payload).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(SECRET)
}
export async function verifyJwt(token: string) {
  try { const {payload}=await jose.jwtVerify(token, SECRET); return payload } catch { return null }
}
// httpOnly cookie helper
export function setAuthCookie(token: string) {
  return `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
}
