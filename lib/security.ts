
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fastpass-secret-key-2024-parkhy5454'

export function createJWT(payload:any){
  return jwt.sign(payload, JWT_SECRET, {expiresIn:'30d'})
}

export function verifyJWT(token:string){
  try{
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  }catch(e){
    console.log('JWT verify failed', e)
    return null
  }
}
