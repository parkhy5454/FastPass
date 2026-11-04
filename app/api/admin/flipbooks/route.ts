
import { prisma } from '@/lib/db'
export async function GET(){
  try{ const p:any = prisma; const fb = await p.flipbook.findMany({ orderBy:{ createdAt:'desc' }, take:500 }); return Response.json(fb) }
  catch{ try{ const p:any = prisma; const fb = await p.$queryRaw`SELECT * FROM "Flipbook" ORDER BY "createdAt" DESC LIMIT 500`; return Response.json(fb) } catch{ return Response.json([]) } }
}
