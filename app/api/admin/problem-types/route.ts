
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, isAdmin } from '@/lib/security'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

// In-memory store for problem types (until DB table exists)
let problemTypesStore: any[] = []

export async function GET(){
  try{
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value
    if(token){
      const payload = verifyJWT(token)
      if(payload){
        try{
          const types = await prisma.problemType?.findMany?.({orderBy:{createdAt:'desc'}}).catch(()=>null)
          if(types && types.length>0){
            return NextResponse.json({types})
          }
        }catch{}
      }
    }
    return NextResponse.json({types: problemTypesStore})
  }catch(e:any){
    return NextResponse.json({types: problemTypesStore})
  }
}

export async function POST(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload.loginId, payload.role)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }

    const {name, category} = await req.json()
    if(!name || !name.trim()) return NextResponse.json({error:'이름 필요'},{status:400})
    if(!category) return NextResponse.json({error:'카테고리 필요'},{status:400})

    const newType = {
      id: Date.now().toString(),
      name: name.trim(),
      category: category.trim(),
      count:0,
      createdAt: new Date().toISOString()
    }

    // Try DB
    try{
      const created = await prisma.problemType?.create?.({data:{name: newType.name, category: newType.category} as any})
      if(created) return NextResponse.json({ok:true, type: created})
    }catch{}

    // Fallback to memory
    problemTypesStore.push(newType)
    return NextResponse.json({ok:true, type: newType})

  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}

export async function DELETE(req: NextRequest){
  try{
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})
    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload.loginId, payload.role)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }

    const id = req.nextUrl.searchParams.get('id')
    if(!id) return NextResponse.json({error:'ID 필요'},{status:400})

    try{
      await prisma.problemType?.delete?.({where:{id}}).catch(()=>{})
    }catch{}

    problemTypesStore = problemTypesStore.filter(t=> t.id!==id)

    return NextResponse.json({ok:true})

  }catch(e:any){
    return NextResponse.json({error:e.message},{status:500})
  }
}
