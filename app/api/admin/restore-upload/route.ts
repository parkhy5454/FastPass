import { prisma } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'
// 복원 빠른 업로드 에디터 - 관리자가 텍스트 붙여넣으면 자동 생성
export async function POST(req: Request) {
  const auth = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1] || req.headers.get('authorization')?.replace('Bearer ','')
  const payload: any = auth ? await verifyJwt(auth) : null
  if (payload?.role !== 'ADMIN') return Response.json({error:'권한 없음'}, {status:403})
  const { title, certType, year, round, questions } = await req.json() // questions: [{subject, question, options, answer, keyword}]
  const flipbook = await prisma.flipbook.create({
    data: {
      title, certType, year, round, type: 'RESTORE',
      price: 0, totalPages: questions.length, coverUrl: '/covers/restore.png', isPublished: true
    }
  })
  for (let i=0; i<questions.length; i++) {
    const q = questions[i]
    await prisma.flipbookPage.create({
      data: {
        flipbookId: flipbook.id,
        pageNumber: i+1,
        imageUrl: `/pages/restore-${flipbook.id}-${i+1}.png`,
        subject: q.subject,
        subjectNo: (i % 20)+1,
        question: q,
        solution: q.solution || null,
        keyword: q.keyword
      }
    })
    // Analysis도 자동 추가
    await prisma.analysis.create({ data: { certType, year, round, subject: q.subject, keyword: q.keyword, count: 1 } })
  }
  return Response.json({ flipbookId: flipbook.id, count: questions.length })
}
