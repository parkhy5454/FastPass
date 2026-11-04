
const JWT_SECRET = process.env.JWT_SECRET || 'fastpass-secret-key-2024-parkhy5454'

function base64urlEncode(str:string){
  return Buffer.from(str).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
}
function base64urlDecode(str:string){
  str = str.replace(/-/g,'+').replace(/_/g,'/')
  while(str.length % 4) str += '='
  return Buffer.from(str, 'base64').toString()
}

export function createJWT(payload:any){
  const header = {alg:'HS256', typ:'JWT'}
  const now = Math.floor(Date.now()/1000)
  const exp = now + 30*24*60*60
  const fullPayload = {...payload, iat: now, exp}
  const headerB64 = base64urlEncode(JSON.stringify(header))
  const payloadB64 = base64urlEncode(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`
  const crypto = require('crypto')
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  return `${data}.${signature}`
}
export const signJWT = createJWT

export function verifyJWT(token:string){
  try{
    if(!token) return null
    const parts = token.split('.')
    if(parts.length !== 3) return null
    const [headerB64, payloadB64, signature] = parts
    const data = `${headerB64}.${payloadB64}`
    const crypto = require('crypto')
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
    if(signature !== expectedSig) return null
    const payloadJson = base64urlDecode(payloadB64)
    const payload = JSON.parse(payloadJson)
    const now = Math.floor(Date.now()/1000)
    if(payload.exp && payload.exp < now) return null
    return payload
  }catch{ return null }
}

export function hashPassword(password:string){
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex')
}
export function verifyPassword(password:string, hash:string){
  return hashPassword(password) === hash
}
export function generateCSRFToken(){
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

// Fixed: accepts 1 or 2 args - (loginId, role) or (payload)
export function isAdmin(loginIdOrPayload:any, roleOrUndefined?:any){
  if(!loginIdOrPayload) return false
  // Case: isAdmin(loginId, role)
  if(typeof loginIdOrPayload === 'string'){
    const loginId = loginIdOrPayload
    const role = roleOrUndefined
    if(role === 'ADMIN') return true
    return loginId.includes('parkhy5454') || loginId === 'admin' || loginId === 'demo'
  }
  // Case: isAdmin(payload)
  const p = loginIdOrPayload
  return p.role === 'ADMIN' || p.loginId?.includes('parkhy5454') || p.loginId === 'admin' || p.email?.includes('parkhy5454') || p.loginId === 'demo'
}

export function validateLoginId(loginId:string){
  if(!loginId || loginId.length < 3) return {valid:false, error:'아이디는 3자 이상'}
  if(loginId.length > 20) return {valid:false, error:'아이디는 20자 이하'}
  if(!/^[a-zA-Z0-9_@.]+$/.test(loginId)) return {valid:false, error:'아이디 형식 오류'}
  return {valid:true}
}
export function validatePassword(password:string){
  if(!password || password.length < 4) return {valid:false, error:'비밀번호 4자 이상'}
  if(password.length > 50) return {valid:false, error:'비밀번호 50자 이하'}
  return {valid:true}
}
export function sanitizeInput(input:string){
  if(!input) return ''
  return input.toString().trim().slice(0,1000).replace(/<script>/gi,'').replace(/<\/script>/gi,'')
}
export function validatePDFFile(file:any){
  if(!file) return {valid:false, error:'파일 없음'}
  const maxSize = 50*1024*1024
  if(file.size > maxSize) return {valid:false, error:'파일 50MB 이하'}
  return {valid:true}
}
export function validatePDFMagicBytes(buffer:any){
  try{
    const header = Buffer.from(buffer.slice(0,4)).toString()
    if(!header.startsWith('%PDF')) return {valid:false, error:'PDF 파일이 아닙니다'}
    return {valid:true}
  }catch{ return {valid:false, error:'PDF 검증 실패'} }
}
const loginAttempts = new Map<string, {count:number, lastAttempt:number}>()
export function checkRateLimit(ip:string){
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if(!record) return {allowed:true}
  if(record.count >= 5 && now - record.lastAttempt < 10*60*1000){
    return {allowed:false, error:'5회 실패, 10분 후 재시도'}
  }
  if(now - record.lastAttempt > 10*60*1000){
    loginAttempts.delete(ip)
    return {allowed:true}
  }
  return {allowed:true}
}
export function recordLoginAttempt(ip:string, success:boolean){
  const now = Date.now()
  if(success){ loginAttempts.delete(ip); return }
  const record = loginAttempts.get(ip) || {count:0, lastAttempt:now}
  record.count += 1
  record.lastAttempt = now
  loginAttempts.set(ip, record)
}
