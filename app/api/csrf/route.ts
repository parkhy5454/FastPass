
import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/csrf'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'

export async function GET(){
  try{
    const token = cookies().get('token')?.value
    let sessionId = 'anonymous'
    if(token){
      const payload = verifyJWT(token)
      if(payload) sessionId = payload.id || payload.loginId || 'user'
    }
    const csrfToken = generateCSRFToken(sessionId)
    const res = NextResponse.json({csrfToken})
    res.cookies.set('csrf', csrfToken, {httpOnly:false, secure:true, sameSite:'lax', maxAge:60*60, path:'/'})
    return res
  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
