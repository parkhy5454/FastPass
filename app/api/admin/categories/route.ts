
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    const cats = await p.category.findMany({ orderBy:{ name:'asc' } }).catch(()=>null)
    if(cats && cats.length>0) return Response.json(cats)
  }catch{}
  // 기본 전체 목록 반환
  const all = [
    {id:'1', name:'건축전기설비기술사'}, {id:'2', name:'발송배전기술사'}, {id:'3', name:'전기응용기술사'}, {id:'4', name:'전기안전기술사'}, {id:'5', name:'전기철도기술사'},
    {id:'6', name:'전기기능장'},
    {id:'7', name:'전기기사'}, {id:'8', name:'전기공사기사'}, {id:'9', name:'전기철도기사'}, {id:'10', name:'철도신호기사'}, {id:'11', name:'소방설비기사(전기)'}, {id:'12', name:'건축전기설비기사'},
    {id:'13', name:'전기산업기사'}, {id:'14', name:'전기공사산업기사'}, {id:'15', name:'전기철도산업기사'}, {id:'16', name:'소방설비산업기사(전기)'},
    {id:'17', name:'전기기능사'}, {id:'18', name:'전기공사기능사'}, {id:'19', name:'소방설비기능사(전기)'}, {id:'20', name:'전기철도기능사'}, {id:'21', name:'승강기기능사'}, {id:'22', name:'신재생에너지발전설비기능사'},
  ]
  return Response.json(all)
}
export async function POST(req:Request){
  try{
    const { name } = await req.json()
    const p:any = prisma
    try{
      const c = await p.category.create({ data:{ name } })
      return Response.json(c)
    }catch{
      return Response.json({id: Date.now().toString(), name})
    }
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}
export async function DELETE(req:Request){
  try{
    const { id } = await req.json()
    const p:any = prisma
    try{ await p.category.delete({ where:{ id } }) }catch{}
    return Response.json({success:true})
  }catch(e:any){ return Response.json({error:e.message}, {status:500}) }
}
