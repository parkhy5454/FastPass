
'use client'
import { useEffect, useState } from 'react'
import FlipbookViewer from '@/components/FlipbookViewer'
import PdfFlipbook from '@/components/PdfFlipbook'

export default function FlipbookPage({ params }: { params: { id: string } }){
  const [flipbook, setFlipbook] = useState<any>(null)
  const [pdfSrc, setPdfSrc] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  useEffect(()=>{
    fetch(`/api/flipbooks/${params.id}`, {credentials:'include', cache:'no-store'})
      .then(async r=>{
        const d = await r.json()
        if(!r.ok){ setErrMsg(d?.error || '자료를 열 수 없습니다'); setLoading(false); return }
        setFlipbook(d)
        if(d.hasPdf){
          const pr = await fetch(`/api/flipbooks/${params.id}/pdf`, {credentials:'include', cache:'no-store'})
          const pd = await pr.json()
          if(pr.ok && pd.url) setPdfSrc(pd.url)
          else setErrMsg(pd?.error || 'PDF를 열 수 없습니다')
        }
        setLoading(false)
      })
      .catch(()=>{ setErrMsg('네트워크 오류'); setLoading(false) })
  },[params.id])

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!flipbook) return <main style={{padding:'20px'}}>{errMsg || '문제를 찾을 수 없습니다'}</main>

  // Mock pages - 실제로는 PDF를 이미지로 변환한 URL들
  const mockPages = Array.from({length: 10}, (_,i)=> ``)

  return (
    <main style={{padding:'20px', background:'#F8F9FB', minHeight:'100vh', paddingBottom:'100px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
        <a href="/learn" style={{background:'white', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'8px 14px', textDecoration:'none', color:'#111827', fontWeight:700, fontSize:'13px'}}>← 학습으로</a>
        <div style={{fontWeight:800}}>{flipbook.category} - {flipbook.title}</div>
      </div>
      
      {flipbook.hasPdf && pdfSrc ? (
        <PdfFlipbook url={pdfSrc} title={flipbook.title} />
      ) : (
        <FlipbookViewer
          title={flipbook.title}
          pages={mockPages}
          allowDownload={true}
        />
      )}

      <div style={{marginTop:'20px', background:'white', borderRadius:'12px', padding:'16px'}}>
        <div style={{fontWeight:700, fontSize:'14px'}}>📚 {flipbook.title}</div>
        <div style={{fontSize:'12px', color:'#6B7280', marginTop:'6px'}}>분류: {flipbook.category} / {flipbook.type}</div>
        <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'8px', lineHeight:'1.6'}}>
          • 모서리를 끌거나 버튼으로 페이지를 넘기세요<br/>
          • 페이지를 넘길 때 종이 넘기는 소리가 납니다(소리 버튼으로 끌 수 있음)
        </div>
      </div>
    </main>
  )
}
