
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

function decodeJwt(token:string){
  try{
    const payload = token.split('.')[1]
    const json = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(json)
  }catch{ return null }
}

export async function POST(req:Request){
  try{
    const token = cookies().get('token')?.value
    const payload = token ? decodeJwt(token) : null
    if(!payload) return Response.json({ error:'로그인 필요' }, {status:401})

    const body = await req.json()
    const { flipbookId, wrongPages, answers } = body

    const p:any = prisma
    if(p.wrongNote){
      for(const wp of wrongPages || []){
        try{
          await p.wrongNote.create({
            data:{
              userId: payload.id || payload.loginId,
              questionId: wp.pageId || wp.id || String(wp),
              certType: flipbookId || 'mock',
            }
          })
        }catch(e){ console.log('wrongNote create skip', e) }
      }
    }

    return Response.json({ success:true, saved: wrongPages?.length || 0 })
  }catch(e:any){
    return Response.json({ success:false, error:e.message }, {status:500})
  }
}
