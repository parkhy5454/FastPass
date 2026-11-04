import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/session'

export async function POST(req: Request) {
  const auth = requireUser()
  if ('response' in auth) return auth.response
  const userId: string = auth.session.id
  try {
    const { flipbookId, wrongPages } = await req.json()
    const p: any = prisma
    let saved = 0
    if (p.wrongNote && Array.isArray(wrongPages)) {
      for (const wp of wrongPages) {
        const questionId = String(wp?.pageId || wp?.id || wp)
        try {
          await p.wrongNote.create({ data: { userId, questionId, certType: flipbookId ? String(flipbookId) : 'mock' } })
          saved++
        } catch (e) {
          console.log('wrongNote create skip', e)
        }
      }
    }
    return Response.json({ success: true, saved })
  } catch {
    return Response.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}
