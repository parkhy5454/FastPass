
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
export async function POST(req:Request){
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try{
    const { title, certType, year, round, questions } = await req.json()
    const p:any = prisma
    if(!p.flipbook){
      return Response.json({ success:false, error:'Flipbook table not ready, deploying...' }, {status:200})
    }
    const flipbook = await p.flipbook.create({
      data: {
        title, certType, year, round, type: 'RESTORE',
        price: 0, totalPages: questions.length, coverUrl: '/covers/restore.png', isPublished: true
      }
    })
    if(questions && p.flipbookPage){
      for(let i=0;i<questions.length;i++){
        const q = questions[i]
        await p.flipbookPage.create({
          data:{
            flipbookId: flipbook.id,
            pageNumber: i+1,
            subject: q.subject,
            question: q.question,
            options: q.options,
            answer: q.answer,
            keyword: q.keyword
          }
        })
      }
    }
    return Response.json({ success:true, id: flipbook.id })
  }catch(e:any){
    return Response.json({ success:false, error:e.message }, {status:500})
  }
}

export async function GET(){
  const auth = requireAdmin()
  if ('response' in auth) return auth.response
  try{
    const p:any = prisma
    if(!p.flipbook) return Response.json({ flipbooks: [] })
    const flipbooks = await p.flipbook.findMany({ take:20, orderBy:{ createdAt:'desc' } })
    return Response.json({ flipbooks })
  }catch(e:any){
    return Response.json({ flipbooks: [], error:e.message })
  }
}
