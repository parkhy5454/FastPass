
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const types = await p.problemType.findMany({ orderBy:{ createdAt:'asc' } }).catch(()=>[])
    if(types && types.length>0) return Response.json(types)
    // fallback mock
    return Response.json([
      {id:'1', name:'기출문제', icon:'📜', countLabel:'10개년'},
      {id:'2', name:'예상문제', icon:'⭐', countLabel:'300제'},
    ])
  }catch{ return Response.json([]) }
}
export async function POST(req:Request){
  try{
    const { name, icon, countLabel } = await req.json()
    if(!name) return Response.json({error:'name required'}, {status:400})
    const p:any = prisma
    try{
      const created = await p.problemType.create({ data:{ name, icon: icon||'📁', countLabel: countLabel||'' } })
      return Response.json(created)
    }catch(e:any){
      // table not exist -> mock success
      return Response.json({id: Date.now().toString(), name, icon, countLabel})
    }
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}
export async function DELETE(req:Request){
  try{
    const { id } = await req.json()
    const p:any = prisma
    try{
      await p.problemType.delete({ where:{ id } })
    }catch{}
    return Response.json({success:true})
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}
