
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'

let memoryProblemTypes: any[] = [
  {id:'전기기사_기출 10년_1', qual:'전기기사', name:'기출 10년', count:300, createdAt: new Date().toISOString()},
  {id:'전기기사_예상문제_2', qual:'전기기사', name:'예상문제', count:300, createdAt: new Date().toISOString()},
]

export async function GET(req: NextRequest){
  try{
    const {searchParams} = new URL(req.url)
    const qual = searchParams.get('qual')
    let types = memoryProblemTypes
    if(qual) types = types.filter(t=> t.qual===qual)
    return NextResponse.json({problemTypes: types})
  }catch{ return NextResponse.json({problemTypes: memoryProblemTypes}) }
}

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})
    const {qual, name, count} = await req.json()
    if(!qual || !name) return NextResponse.json({error:'자격증과 문제 유형 필수'},{status:400})

    const newType = {
      id: `${qual}_${name}_${Date.now()}`,
      qual,
      name,
      count: count||0,
      createdAt: new Date().toISOString(),
      userId: payload.id
    }
    // prevent duplicate
    if(!memoryProblemTypes.find(t=> t.qual===qual && t.name===name)){
      memoryProblemTypes.push(newType)
    }
    return NextResponse.json({ok:true, problemType: newType, problemTypes: memoryProblemTypes})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}

export async function DELETE(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})
    const {searchParams} = new URL(req.url)
    const id = searchParams.get('id')
    if(!id) return NextResponse.json({error:'id 필요'},{status:400})
    memoryProblemTypes = memoryProblemTypes.filter(t=> t.id!==id)
    return NextResponse.json({ok:true, problemTypes: memoryProblemTypes})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
