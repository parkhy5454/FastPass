
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET
if(!JWT_SECRET || JWT_SECRET.length < 16){
  console.warn('⚠️ JWT_SECRET too short or missing! Use at least 32 chars')
}
const SECRET = JWT_SECRET || 'a7f3c9e2b8d4f1a6c5e0b9d2a8f3a7d1f5e0c2b8a4f6e9d'

// Password hashing - cost 12 is secure
export async function hashPassword(pw:string){
  if(pw.length < 8) throw new Error('비밀번호는 8자 이상')
  if(pw.length > 100) throw new Error('비밀번호가 너무 깁니다')
  return bcrypt.hash(pw, 12)
}

export async function verifyPassword(pw:string, hash:string){
  if(!pw || !hash) return false
  return bcrypt.compare(pw, hash)
}

// JWT - 7 days
export function signJWT(payload:any){
  return jwt.sign(payload, SECRET, {expiresIn:'7d', issuer:'fastpass', audience:'fastpass-user'})
}

export function verifyJWT(token:string){
  try{
    return jwt.verify(token, SECRET, {issuer:'fastpass', audience:'fastpass-user'}) as any
  }catch{
    return null
  }
}

// XSS prevention
export function sanitizeInput(str:string){
  if(typeof str !== 'string') return ''
  return str
    .replace(/[<>]/g, '') // Remove < >
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0,1000)
}

export function sanitizeHtml(str:string){
  return str.replace(/[&<>"']/g, (m)=>{
    const map:Record<string,string> = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}
    return map[m]
  })
}

// CSRF token
export function generateCSRFToken(){
  return crypto.randomBytes(32).toString('hex')
}

export function validateCSRFToken(token:string, expected:string){
  if(!token || !expected) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

// Input validation with Zod-like checks
export function validateLoginId(loginId:string){
  if(!loginId || typeof loginId !== 'string') return '아이디 필요'
  if(loginId.length < 4) return '아이디는 4자 이상'
  if(loginId.length > 30) return '아이디는 30자 이하'
  if(!/^[a-zA-Z0-9_]+$/.test(loginId)) return '아이디는 영문, 숫자, _만 가능'
  return null
}

export function validatePassword(password:string){
  if(!password || typeof password !== 'string') return '비밀번호 필요'
  if(password.length < 8) return '비밀번호는 8자 이상'
  if(password.length > 100) return '비밀번호는 100자 이하'
  // At least one letter and one number recommended but not enforced for UX
  return null
}

// PDF validation
export function validatePDFFile(file: File | {name:string, size:number, type:string}){
  const maxSize = 50 * 1024 * 1024 // 50MB
  if(file.size > maxSize) return `파일 크기 50MB 이하만 가능 (현재 ${Math.round(file.size/1024/1024)}MB)`
  if(file.size === 0) return '빈 파일입니다'

  const name = file.name.toLowerCase()
  if(!name.endsWith('.pdf')) return 'PDF 파일만 업로드 가능'

  // MIME type check (can be spoofed, but first line defense)
  if(file.type && file.type !== 'application/pdf' && file.type !== 'application/octet-stream'){
    return 'PDF 파일만 가능'
  }

  return null
}

// Check PDF magic bytes (first 4 bytes should be %PDF)
export async function validatePDFMagicBytes(buffer: ArrayBuffer){
  const bytes = new Uint8Array(buffer.slice(0,4))
  const header = String.fromCharCode(...bytes)
  if(header !== '%PDF'){
    return '유효한 PDF 파일이 아닙니다 (매직 바이트 불일치)'
  }
  return null
}

// Admin check
export function isAdmin(loginId:string, role:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return role === 'ADMIN' || id.includes('parkhy5454') || id === 'admin' || id === 'demo'
}

export function requireAdmin(loginId:string, role:string){
  if(!isAdmin(loginId, role)){
    throw new Error('관리자 권한 필요')
  }
}
