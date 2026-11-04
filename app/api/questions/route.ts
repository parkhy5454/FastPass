
export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || '전기기사'
  
  // Question 모델이 아직 없어도 빌드 성공하게 fallback
  try{
    const { prisma } = await import('@/lib/db')
    const p:any = prisma
    if(p.question){
      const questions = await p.question.findMany({ 
        where:{ OR:[{ category }, { subject: category }] },
        take:100,
        orderBy:{ createdAt:'desc' }
      })
      return Response.json({ questions, count: questions.length })
    }
  }catch(e){
    console.log('question table not exist yet', e)
  }

  // 샘플 데이터 반환 (DB 없어도 동작)
  return Response.json({ 
    count:2, 
    questions:[
      { id:'1', question:`${category} 샘플 문제 1 - 옴의 법칙에 대한 설명으로 옳은 것은?`, choices:['V=IR','V=I/R','V=R/I','V=I+R'], answer:0, explanation:'옴의 법칙은 V=IR' },
      { id:'2', question:`${category} 샘플 문제 2 - 변압기의 원리는?`, choices:['전자유도','정전유도','표피효과','코로나'], answer:0, explanation:'전자유도 법칙' },
    ]
  })
}
