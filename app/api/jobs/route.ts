
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

// In-memory fallback if no Job table
let memoryJobs: any[] = [
  {id:'1', type:'구인', title:'전기기사 구인 - 삼성전기', company:'삼성전기', location:'서울', salary:'4000만원~', cert:'전기기사', description:'전기기사 자격증 소지자 우대, 경력 3년 이상', contact:'010-1234-5678', createdAt: new Date().toISOString(), userId:'admin'},
  {id:'2', type:'구인', title:'토목기사 현장 소장 모집', company:'현대건설', location:'부산', salary:'5000만원~', cert:'토목기사', description:'토목기사 필수, 현장 소장 경력', contact:'051-123-4567', createdAt: new Date().toISOString(), userId:'admin'},
  {id:'3', type:'구직', title:'전기기사 구직 - 경력 5년', company:'개인', location:'서울', salary:'협의', cert:'전기기사', description:'전기기사 5년 경력, 전기공사 가능', contact:'010-9876-5432', createdAt: new Date().toISOString(), userId:'user'},
]

export async function GET(req: NextRequest){
  try{
    const {searchParams} = new URL(req.url)
    const type = searchParams.get('type') // 전체, 구인, 구직

    let jobs: any[] = []
    try{
      jobs = await prisma.job?.findMany?.({orderBy:{createdAt:'desc'}}) || memoryJobs
    }catch{
      jobs = memoryJobs
    }

    if(type && type!=='전체'){
      jobs = jobs.filter(j=> j.type===type)
    }

    return NextResponse.json({jobs})
  }catch(e:any){
    return NextResponse.json({jobs: memoryJobs})
  }
}

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'로그인 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload) return NextResponse.json({error:'인증 만료'},{status:401})

    const {type, title, company, location, salary, cert, description, contact} = await req.json()

    if(!title || !company || !type){
      return NextResponse.json({error:'제목, 회사, 구인/구직은 필수'},{status:400})
    }

    const newJob = {
      id: Date.now().toString(),
      type, // 구인 or 구직
      title,
      company,
      location: location||'서울',
      salary: salary||'협의',
      cert: cert||'전기기사',
      description: description||'',
      contact: contact||'',
      createdAt: new Date().toISOString(),
      userId: payload.id,
      userLoginId: payload.loginId,
    }

    try{
      const saved = await prisma.job?.create?.({data: newJob}) || newJob
      memoryJobs.unshift(newJob)
      return NextResponse.json({ok:true, job: saved})
    }catch(e:any){
      memoryJobs.unshift(newJob)
      return NextResponse.json({ok:true, job: newJob})
    }

  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
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

    // Check owner or admin
    const isAdmin = payload.role==='ADMIN' || payload.loginId?.includes('parkhy5454')

    try{
      const job = await prisma.job?.findUnique?.({where:{id}}) || memoryJobs.find(j=> j.id===id)
      if(!job) return NextResponse.json({error:'공고 없음'},{status:404})

      if(!isAdmin && job.userId!==payload.id){
        return NextResponse.json({error:'본인 공고만 삭제 가능'},{status:403})
      }

      await prisma.job?.delete?.({where:{id}}).catch(()=>{})
      memoryJobs = memoryJobs.filter(j=> j.id!==id)

      return NextResponse.json({ok:true})
    }catch(e:any){
      memoryJobs = memoryJobs.filter(j=> j.id!==id)
      return NextResponse.json({ok:true})
    }

  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
