import { prisma } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'
export async function POST(req: Request) {
  const auth = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1] || ''
  const payload: any = await verifyJwt(auth)
  if (!payload) return Response.json({error:'로그인 필요'}, {status:401})
  const { flipbookId, answers, timeUsed } = await req.json() // answers: [{pageId, selected}]
  const pages = await prisma.flipbookPage.findMany({ where: { flipbookId } })
  let correct = 0
  const subjectScores: any = {}
  const subjectTotal: any = {}
  pages.forEach(p=>{
    const q: any = p.question
    const ans = answers.find((a:any)=>a.pageId===p.id)
    const subj = p.subject || '기타'
    subjectTotal[subj] = (subjectTotal[subj]||0)+1
    if (ans && ans.selected === q.answer) { correct++; subjectScores[subj]=(subjectScores[subj]||0)+1 }
  })
  const score = (correct/pages.length)*100
  const passed = score >= 60 && Object.keys(subjectScores).every(s=> (subjectScores[s]/subjectTotal[s])*100 >= 40)
  // 오답노트 자동 생성
  for (const p of pages) {
    const ans = answers.find((a:any)=>a.pageId===p.id)
    const q: any = p.question
    if (!ans || ans.selected !== q.answer) {
      await prisma.wrongNote.create({
        data: {
          userId: payload.id,
          flipbookId,
          pageId: p.id,
          question: p.question as any,
          nextReviewAt: new Date(Date.now()+3*24*60*60*1000), // 3일 후
          reviewCount: 0
        }
      })
    }
  }
  const result = await prisma.mockResult.create({
    data: { userId: payload.id, flipbookId, totalQ: pages.length, correctQ: correct, score, subjectScores, timeUsed, passed }
  })
  return Response.json(result)
}
