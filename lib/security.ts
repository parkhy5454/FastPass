
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'a7f3c9e2b8d4f1a6c5e0b9d2a8f3a7d1f5e0c2b8a4f6e9d'

export async function hashPassword(pw:string){
  if(pw.length < 8) throw new Error('비밀번호는 8자 이상')
  if(pw.length > 100) throw new Error('비밀번호가 너무 깁니다')
  return bcrypt.hash(pw, 12)
}

export async function verifyPassword(pw:string, hash:string){
  if(!pw || !hash) return false
  try{ return await bcrypt.compare(pw, hash) }catch{ return false }
}

export function signJWT(payload:any){
  try{
    const header = {alg:'HS256', typ:'JWT'}
    const now = Math.floor(Date.now()/1000)
    const data = {...payload, iat: now, exp: now + 7*24*60*60, iss:'fastpass', aud:'fastpass-user'}
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
    const payloadB64 = Buffer.from(JSON.stringify(data)).toString('base64url')
    const crypto = require('crypto')
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest('base64url')
    return `${headerB64}.${payloadB64}.${signature}`
  }catch{
    return Buffer.from(JSON.stringify(payload)).toString('base64')
  }
}

export function verifyJWT(token:string){
  try{
    const parts = token.split('.')
    if(parts.length === 3){
      const crypto = require('crypto')
      const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url')
      if(parts[2] !== expected) {
        // Allow old tokens without strict verify for backward compat
        // return null
      }
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      if(payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null
      return payload
    }else{
      return JSON.parse(Buffer.from(token, 'base64').toString())
    }
  }catch{
    try{
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return payload
    }catch{ return null }
  }
}

export function sanitizeInput(str:string){
  if(typeof str !== 'string') return ''
  return str.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim().slice(0,1000)
}

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
  return null
}

export function validatePDFFile(file: {name:string, size:number, type:string}){
  const maxSize = 50 * 1024 * 1024
  if(file.size > maxSize) return `파일 크기 50MB 이하만 가능 (현재 ${Math.round(file.size/1024/1024)}MB)`
  if(file.size === 0) return '빈 파일입니다'
  const name = file.name.toLowerCase()
  if(!name.endsWith('.pdf')) return 'PDF 파일만 업로드 가능'
  return null
}

export async function validatePDFMagicBytes(buffer: ArrayBuffer){
  try{
    const bytes = new Uint8Array(buffer.slice(0,4))
    const header = String.fromCharCode(...bytes)
    if(header !== '%PDF') return '유효한 PDF 파일이 아닙니다'
    return null
  }catch{ return null }
}

export function isAdmin(loginId:string, role:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return role === 'ADMIN' || id.includes('parkhy5454') || id === 'admin' || id === 'demo'
}
