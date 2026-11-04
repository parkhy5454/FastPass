
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
const prisma = new PrismaClient() as any
function getUserId(){ try{ const token = cookies().get('token')?.value; if(!token) return null; const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); return payload.id }catch{ return null } }
export async function GET(){ try{ const userId = getUserId(); if(!userId) return NextResponse.json([]); const notes = await prisma.wrongNote?.findMany?.({where:{userId}, orderBy:{updatedAt:'desc'}}).catch(()=>[]) || []; return NextResponse.json(notes) }catch{ return NextResponse.json([]) } }
export async function POST(req: NextRequest){
  try{
    const userId = getUserId(); if(!userId) return NextResponse.json({error:'unauthorized'},{status:401})
    if(!prisma.wrongNote) return NextResponse.json({ok:true, message:'WrongNote table not yet created'})
    const {questionId, questionTitle, category} = await req.json()
    const existing = await prisma.wrongNote.findFirst({where:{userId, questionId}}).catch(()=>null) as any
    if(existing){ const updated = await prisma.wrongNote.update({where:{id:existing.id}, data:{count:{increment:1}, updatedAt:new Date()} as any}).catch(()=>null); return NextResponse.json(updated) }
    const created = await prisma.wrongNote.create({data:{userId, questionId, questionTitle: questionTitle||'', category: category||'', count:1} as any}).catch(()=>null)
    return NextResponse.json(created||{ok:true})
  }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
export async function DELETE(req: NextRequest){
  try{ const userId = getUserId(); const {questionId} = await req.json(); if(prisma.wrongNote) await prisma.wrongNote.deleteMany({where:{userId, questionId}}).catch(()=>{}); return NextResponse.json({ok:true}) }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) }
}
