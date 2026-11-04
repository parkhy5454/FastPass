
import crypto from 'crypto'

const CSRF_SECRET = process.env.JWT_SECRET || 'csrf-secret-key'

export function generateCSRFToken(sessionId: string){
  const token = crypto.randomBytes(32).toString('hex')
  const hmac = crypto.createHmac('sha256', CSRF_SECRET).update(`${sessionId}:${token}`).digest('hex')
  return `${token}.${hmac}`
}

export function verifyCSRFToken(sessionId: string, csrfToken: string){
  try{
    const [token, hmac] = csrfToken.split('.')
    if(!token || !hmac) return false
    const expected = crypto.createHmac('sha256', CSRF_SECRET).update(`${sessionId}:${token}`).digest('hex')
    return hmac === expected
  }catch{ return false }
}
