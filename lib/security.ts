
// Fixed: No external jsonwebtoken dependency - uses native crypto
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
  const exp = now + 30*24*60*60 // 30 days
  const fullPayload = {...payload, iat: now, exp}

  const headerB64 = base64urlEncode(JSON.stringify(header))
  const payloadB64 = base64urlEncode(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`

  // Simple HMAC using Node crypto
  const crypto = require('crypto')
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')

  return `${data}.${signature}`
}

export function verifyJWT(token:string){
  try{
    if(!token) return null
    const parts = token.split('.')
    if(parts.length !== 3) return null

    const [headerB64, payloadB64, signature] = parts
    const data = `${headerB64}.${payloadB64}`

    const crypto = require('crypto')
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')

    if(signature !== expectedSig){
      console.log('JWT signature mismatch')
      return null
    }

    const payloadJson = base64urlDecode(payloadB64)
    const payload = JSON.parse(payloadJson)

    // Check exp
    const now = Math.floor(Date.now()/1000)
    if(payload.exp && payload.exp < now){
      console.log('JWT expired')
      return null
    }

    return payload
  }catch(e){
    console.log('JWT verify failed', e)
    return null
  }
}

export function hashPassword(password:string){
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex')
}

export function verifyPassword(password:string, hash:string){
  const hashed = hashPassword(password)
  return hashed === hash
}

export function generateCSRFToken(){
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}
