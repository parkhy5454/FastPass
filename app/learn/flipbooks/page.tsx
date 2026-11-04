'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function FlipbookList(){
  const router = useRouter()
  const params = useSearchParams()
  const cert = params.get('cert') || ''
  const type = params.get('type') || ''
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/admin/flipbooks')
      .then(r=>r.json())
      .then(d=>{ setList(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(()=> setLoading(false))
  },[])

  const items = list.filter((f:any)=> f.category===cert && f.type===type)

  return (
    <main style={{padding:20, background:'#F8F9FB', minHeight:'100vh'}}>
      <button onClick={()=>router.push('/learn')} style={{background:'white', border:'1px solid #E5E7EB', borderRadius:10, padding:'8px 14px', fontWeight:700, fontSize:13, cursor:'pointer'}}>← 학습으로</button>
      <h2 style={{fontSize:18, fontWeight:800, margin:'16px 0 12px'}}>{cert} · {type}</h2>
      {loading && <div style={{color:'#6B7280', fontSize:13}}>로딩중...</div>}
      {!loading && items.length===0 && <div style={{color:'#6B7280', fontSize:13}}>등록된 파일이 없습니다</div>}
      {items.map((f:any)=>(
        <a key={f.id} href={`/flipbook/${f.id}`} style={{display:'block', background:'white', borderRadius:12, padding:16, marginBottom:10, textDecoration:'none', color:'#1a1a2e', border:'1px solid #EEF2F7'}}>
          <div style={{fontWeight:700, fontSize:14}}>{f.title}</div>
          <div style={{fontSize:11, color:'#6B7280', marginTop:4}}>{f.type} · {f.pdfUrl ? 'PDF' : '파일 없음'}</div>
        </a>
      ))}
    </main>
  )
}

export default function FlipbookListPage(){
  return <Suspense fallback={null}><FlipbookList /></Suspense>
}
