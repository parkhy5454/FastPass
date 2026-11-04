
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'a7f3c9e2b8d4f1a6c5e0b9d2a8f3a7d1f5e0c2b8a4f6e9d'
export async function hashPassword(pw:string){ return bcrypt.hash(pw, 12) }
export async function verifyPassword(pw:string, hash:string){ return bcrypt.compare(pw, hash) }
export function signJWT(payload:any){ return jwt.sign(payload, JWT_SECRET, {expiresIn:'7d'}) }
export function verifyJWT(token:string){ try{ return jwt.verify(token, JWT_SECRET) }catch{ return null } }
export function sanitizeInput(str:string){ return str.replace(/[<>\"']/g, '').trim().slice(0,500) }
