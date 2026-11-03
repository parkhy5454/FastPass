
import { prisma } from '@/lib/db'
export async function GET(req:Request){
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || '전기기사'
  try{
    const questions = await prisma.question.findMany({ 
      where:{ OR:[{ category },{ subject: category }] } as any,
      take:100,
      orderBy:{ createdAt:'desc' } as any
    })
    return Response.json({ questions, count: questions.length })
  }catch(e:any){
    // 샘플 데이터 반환
    return Response.json({ 
      count:0, 
      sample:[],
      questions:[
        { id:'1', question:`${category} 샘플 문제 1 - 옴의 법칙에 대한 설명으로 옳은 것은?`, choices:['V=IR','V=I/R','V=R/I','V=I+R'], answer:0, explanation:'옴의 법칙은 V=IR' },
        { id:'2', question:`${category} 샘플 문제 2 - 변압기의 원리는?`, choices:['전자유도','정전유도','표피효과','코로나'], answer:0, explanation:'전자유도 법칙' },
      ]
    })
  }
}
