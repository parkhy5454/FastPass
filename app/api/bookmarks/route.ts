
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
const prisma = new PrismaClient()
function getUserId(){ try{ const token = cookies().get('token')?.value; if(!token) return null; const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()); return payload.id }catch{ return null } }
export async function GET(){ try{ const userId = getUserId(); if(!userId) return NextResponse.json([]); const bookmarks = await prisma.bookmark.findMany({where:{userId}, orderBy:{createdAt:'desc'}}).catch(()=>[]); return NextResponse.json(bookmarks) }catch{ return NextResponse.json([]) } }
export async function POST(req: NextRequest){ try{ const userId = getUserId(); if(!userId) return NextResponse.json({error:'unauthorized'},{status:401}); const {questionId} = await req.json(); const existing = await prisma.bookmark.findFirst({where:{userId, questionId}}).catch(()=>null); if(existing) return NextResponse.json(existing); const created = await prisma.bookmark.create({data:{userId, questionId} as any}).catch(()=>null); return NextResponse.json(created||{ok:true}) }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) } }
export async function DELETE(req: NextRequest){ try{ const userId = getUserId(); const {questionId} = await req.json(); await prisma.bookmark.deleteMany({where:{userId, questionId}}).catch(()=>{}); return NextResponse.json({ok:true}) }catch(e:any){ return NextResponse.json({error:e.message},{status:500}) } }
