
import { NextRequest } from 'next/server'
const attempts = new Map<string, {count:number, first:number}>()
export function checkRateLimit(ip: string, maxAttempts=5, windowMs=10*60*1000){
  const now = Date.now()
  const record = attempts.get(ip)
  if(!record || now - record.first > windowMs){
    attempts.set(ip, {count:1, first:now})
    return {allowed:true, remaining:maxAttempts-1, retryAfter:0}
  }
  if(record.count >= maxAttempts){
    return {allowed:false, remaining:0, retryAfter: windowMs - (now - record.first)}
  }
  record.count++
  return {allowed:true, remaining: maxAttempts - record.count, retryAfter:0}
}
export function getIP(req: NextRequest){
  return req.headers.get('x-forwarded-for')?.split(',')[0] || (req as any).ip || 'unknown'
}
