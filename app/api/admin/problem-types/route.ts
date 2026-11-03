
import { prisma } from '@/lib/db'

// Simple file-based fallback storage for problem types when DB table doesn't exist
let memoryTypes: any[] = [
  {id:'1', name:'기출문제', icon:'📜', countLabel:'10개년'},
  {id:'2', name:'예상문제', icon:'⭐', countLabel:'300제'},
]

export async function GET(){
  try{
    const p:any = prisma
    const types = await p.problemType.findMany({ orderBy:{ createdAt:'asc' } }).catch(()=>null)
    if(types && types.length>0){
      memoryTypes = types
      return Response.json(types)
    }
  }catch{}
  return Response.json(memoryTypes)
}

export async function POST(req:Request){
  try{
    const { name, icon } = await req.json()
    if(!name) return Response.json({error:'name required'}, {status:400})
    const newType = { id: Date.now().toString(), name: name.trim(), icon: icon||'📁', countLabel:'' }
    
    try{
      const p:any = prisma
      const created = await p.problemType.create({ data:{ name: newType.name, icon: newType.icon, countLabel:'' } })
      memoryTypes.push(created)
      return Response.json(created)
    }catch{
      // DB 테이블 없어도 메모리에는 추가
      memoryTypes.push(newType)
      return Response.json(newType)
    }
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}

export async function DELETE(req:Request){
  try{
    const { id } = await req.json()
    memoryTypes = memoryTypes.filter(t=>t.id!==id)
    try{
      const p:any = prisma
      await p.problemType.delete({ where:{ id } }).catch(()=>{})
    }catch{}
    return Response.json({success:true, types: memoryTypes})
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}
