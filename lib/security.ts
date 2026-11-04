import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// ---------- 비밀키 ----------
// 운영 환경에서는 JWT_SECRET 환경변수가 반드시 있어야 합니다(없으면 오류).
const DEV_SECRET = 'dev-only-insecure-secret-change-me'
function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (s && s.length >= 32) return s
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET 환경변수(32자 이상)가 설정되어 있지 않습니다')
  }
  return DEV_SECRET
}

// ---------- JWT (HS256) ----------
const TOKEN_TTL_SEC = 7 * 24 * 60 * 60

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
function sign(data: string) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function createJWT(payload: Record<string, any>) {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + TOKEN_TTL_SEC }))
  const data = `${header}.${body}`
  return `${data}.${sign(data)}`
}
export const signJWT = createJWT

export function verifyJWT(token: string): Record<string, any> | null {
  try {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signature] = parts
    const header = JSON.parse(Buffer.from(headerB64, 'base64').toString())
    if (header.alg !== 'HS256') return null
    const expected = sign(`${headerB64}.${payloadB64}`)
    const a = Buffer.from(signature), b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// ---------- 권한 ----------
// 관리자 여부는 역할(role)만으로 판단합니다. 아이디·이메일 문자열 검사는 사용하지 않습니다.
export function isAdmin(payload: any): boolean {
  return !!payload && payload.role === 'ADMIN'
}

// ---------- 비밀번호 ----------
// 새 해시는 bcrypt. 예전 SHA-256 해시(솔트 없음)는 로그인 성공 시 bcrypt로 교체합니다.
const BCRYPT_ROUNDS = 12
export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}
export function isLegacyHash(stored: string) {
  return !stored.startsWith('$2')
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false
  if (!isLegacyHash(stored)) return bcrypt.compare(password, stored)
  // 레거시: sha256(password + JWT_SECRET). 기존 계정 호환용으로만 남겨 둡니다.
  const legacySecret = process.env.JWT_SECRET || 'fastpass-secret-key-2024-parkhy5454'
  const legacy = crypto.createHash('sha256').update(password + legacySecret).digest('hex')
  const a = Buffer.from(legacy), b = Buffer.from(stored)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function generateTempPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length]
  return out
}

export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex')
}

// ---------- 입력 검증 ----------
export function validateLoginId(loginId: string) {
  if (!loginId || loginId.length < 3) return { valid: false, error: '아이디는 3자 이상' }
  if (loginId.length > 20) return { valid: false, error: '아이디는 20자 이하' }
  if (!/^[a-zA-Z0-9_@.]+$/.test(loginId)) return { valid: false, error: '아이디 형식 오류' }
  return { valid: true }
}
export function validatePassword(password: string) {
  if (!password || password.length < 8) return { valid: false, error: '비밀번호는 8자 이상' }
  if (password.length > 72) return { valid: false, error: '비밀번호는 72자 이하' } // bcrypt 한계
  return { valid: true }
}
export function sanitizeInput(input: string) {
  if (!input) return ''
  return input.toString().trim().slice(0, 1000)
}
export function validatePDFFile(file: any) {
  if (!file) return { valid: false, error: '파일 없음' }
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) return { valid: false, error: '파일 50MB 이하' }
  return { valid: true }
}
export function validatePDFMagicBytes(buffer: ArrayBuffer) {
  try {
    const header = Buffer.from(buffer.slice(0, 4)).toString()
    if (!header.startsWith('%PDF')) return { valid: false, error: 'PDF 파일이 아닙니다' }
    return { valid: true }
  } catch {
    return { valid: false, error: 'PDF 검증 실패' }
  }
}
