
import { prisma } from '@/lib/db'
export async function GET(){
  try{ const p:any = prisma; const flipbooks = await p.flipbook.findMany({ orderBy:{ createdAt:'desc' }, take:200 }); return Response.json(flipbooks) }
  catch{ try{ const p:any = prisma; const flipbooks = await p.$queryRaw`SELECT * FROM "Flipbook" ORDER BY "createdAt" DESC LIMIT 200`; return Response.json(flipbooks) } catch{ return Response.json([]) } }
}
