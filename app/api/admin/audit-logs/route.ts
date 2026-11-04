
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, isAdmin } from '@/lib/security'

export async function GET(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }
    return NextResponse.json({logs: [], message: 'audit logs'})
  }catch(e:any){
    return NextResponse.json({error: e.message},{status:500})
  }
}
