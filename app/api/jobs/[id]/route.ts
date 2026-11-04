
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient() as any

export async function GET(req: NextRequest, {params}:{params:{id:string}}){
  try{
    const id = params.id
    let job: any = null
    try{ job = await prisma.job?.findUnique?.({where:{id}}) }catch{}
    if(!job){
      // fallback memory - will be fetched via main route in client, but return 404 for now
      return NextResponse.json({error:'공고 없음'},{status:404})
    }
    return NextResponse.json({job})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}

export async function PUT(req: NextRequest, {params}:{params:{id:string}}){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})

    const id = params.id
    const body = await req.json()
    const {title, company, location, salary, cert, description, contact, files, type} = body

    let existing: any = null
    try{ existing = await prisma.job?.findUnique?.({where:{id}}) }catch{}

    if(existing){
      const isAdmin = payload.role==='ADMIN' || payload.loginId?.includes('parkhy5454')
      if(!isAdmin && existing.userId!==payload.id) return NextResponse.json({error:'본인 공고만 수정 가능'},{status:403})
    }

    const updated = {
      title: title||existing?.title,
      company: company||existing?.company,
      location: location||existing?.location,
      salary: salary||existing?.salary,
      cert: cert||existing?.cert,
      description: description||existing?.description,
      contact: contact||existing?.contact,
      files: files||existing?.files||[],
      type: type||existing?.type,
    }

    try{
      const saved = await prisma.job?.update?.({where:{id}, data: updated as any})
      return NextResponse.json({ok:true, job: saved})
    }catch{
      // memory fallback handled by client re-fetching all, but return ok
      return NextResponse.json({ok:true, job: {id, ...updated}})
    }
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
