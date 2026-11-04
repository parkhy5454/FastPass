
import { NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/security'

export async function GET(){
  try{
    const token = generateCSRFToken()
    const res = NextResponse.json({csrfToken: token})
    res.cookies.set('csrf', token, {httpOnly:false, sameSite:'lax', path:'/', maxAge:60*60*24})
    return res
  }catch(e:any){
    return NextResponse.json({csrfToken: 'fallback-token-'+Date.now(), error:e.message})
  }
}
