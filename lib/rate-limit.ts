
import { NextRequest } from 'next/server'

type Attempt = {count:number, first:number, blockedUntil?:number}
const attempts = new Map<string, Attempt>()

// Clean up without downlevelIteration issue - use Array.from
if(typeof setInterval !== 'undefined'){
  setInterval(()=>{
    const now = Date.now()
    const keys = Array.from(attempts.keys())
    for(let i=0; i<keys.length; i++){
      const key = keys[i]
      const val = attempts.get(key)
      if(val && now - val.first > 60*60*1000){
        attempts.delete(key)
      }
    }
  }, 10*60*1000)
}

export function checkRateLimit(ip: string, maxAttempts=5, windowMs=10*60*1000, blockMs=10*60*1000){
  const now = Date.now()
  const record = attempts.get(ip)

  if(!record || now - record.first > windowMs){
    attempts.set(ip, {count:1, first:now})
    return {allowed:true, remaining:maxAttempts-1, retryAfter:0}
  }

  if(record.blockedUntil && now < record.blockedUntil){
    return {allowed:false, remaining:0, retryAfter: record.blockedUntil - now}
  }

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
  const forwarded = req.headers.get('x-forwarded-for')
  if(forwarded){
    return forwarded.split(',')[0].trim()
  }
  return req.headers.get('x-real-ip') || 'unknown'
}
