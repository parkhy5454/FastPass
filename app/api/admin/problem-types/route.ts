
let memoryTypes: any[] = [
  {id:'1', name:'기출문제', icon:'📜', countLabel:'10년'},
  {id:'2', name:'예상문제', icon:'⭐', countLabel:''},
]
export async function GET(){
  try{
    const { prisma } = await import('@/lib/db')
    const p:any = prisma
    const types = await p.problemType.findMany({ orderBy:{ createdAt:'asc' } }).catch(()=>null)
    if(types && types.length>0){ memoryTypes = types; return Response.json(types) }
  }catch{}
  return Response.json(memoryTypes)
}
export async function POST(req:Request){
  try{
    const { name, icon } = await req.json()
    const newType = { id: Date.now().toString(), name: name.trim(), icon: icon||'📁', countLabel:'' }
    try{
      const { prisma } = await import('@/lib/db')
      const p:any = prisma
      const created = await p.problemType.create({ data:{ name: newType.name, icon: newType.icon } })
      memoryTypes.push(created)
      return Response.json(created)
    }catch{
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
      const { prisma } = await import('@/lib/db')
      const p:any = prisma
      await p.problemType.delete({ where:{ id } }).catch(()=>{})
    }catch{}
    return Response.json({success:true})
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}
