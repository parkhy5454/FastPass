
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const folders = await p.problemFolder.findMany({ orderBy:{ createdAt:'asc' } }).catch(()=>[])
    return Response.json(folders)
  }catch{ return Response.json([]) }
}
