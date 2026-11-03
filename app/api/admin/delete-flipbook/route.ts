
import { prisma } from '@/lib/db'
export async function POST(req: Request){
  try{ const { id } = await req.json(); const p:any = prisma; await p.flipbook.delete({ where:{ id } }); return Response.json({ success:true }) }
  catch(e:any){ try{ const { id } = await req.json(); const p:any = prisma; await p.$queryRaw`DELETE FROM "Flipbook" WHERE id = ${id}`; return Response.json({ success:true }) } catch(e2:any){ return Response.json({ error:(e2 as any).message }, { status:500 }) } }
}
