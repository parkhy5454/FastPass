
import { NextRequest } from 'next/server'

// Production: Use Upstash Redis
// import { Ratelimit } from "@upstash/ratelimit"
// import { Redis } from "@upstash/redis"

type Attempt = {count:number, first:number, blockedUntil?:number}
const attempts = new Map<string, Attempt>()

// Clean up old entries every 10 minutes
setInterval(()=>{
  const now = Date.now()
  for(const [key, val] of attempts.entries()){
    if(now - val.first > 60*60*1000) attempts.delete(key)
  }
}, 10*60*1000)

export function checkRateLimit(ip: string, maxAttempts=5, windowMs=10*60*1000, blockMs=10*60*1000){
  const now = Date.now()
  const record = attempts.get(ip)

  if(!record || now - record.first > windowMs){
    attempts.set(ip, {count:1, first:now})
    return {allowed:true, remaining:maxAttempts-1, retryAfter:0}
  }

  // If blocked, check if block time passed
  if(record.blockedUntil && now < record.blockedUntil){
    return {allowed:false, remaining:0, retryAfter: record.blockedUntil - now}
  }

  // Reset block if time passed
  if(record.blockedUntil && now >= record.blockedUntil){
    attempts.set(ip, {count:1, first:now})
    return {allowed:true, remaining:maxAttempts-1, retryAfter:0}
  }

  if(record.count >= maxAttempts){
    record.blockedUntil = now + blockMs
    return {allowed:false, remaining:0, retryAfter: blockMs}
  }

  record.count++
  return {allowed:true, remaining: maxAttempts - record.count, retryAfter:0}
}

export function getIP(req: NextRequest){
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         (req as any).ip || 
         'unknown'
}

export function getRateLimitKey(req: NextRequest, prefix=''){
  const ip = getIP(req)
  const userAgent = req.headers.get('user-agent')?.slice(0,50) || ''
  return `${prefix}${ip}:${userAgent}`
}
