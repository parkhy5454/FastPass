
'use client'
import { useEffect, useState } from 'react'
import FlipbookViewer from '@/components/FlipbookViewer'

export default function FlipbookPage({ params }: { params: { id: string } }){
  const [flipbook, setFlipbook] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch(`/api/admin/flipbooks`).then(r=>r.json()).then(data=>{
      const list = Array.isArray(data) ? data : []
      const found = list.find((f:any)=> f.id === params.id)
      setFlipbook(found || { id: params.id, title: '기출문제', category:'전기기사', fileUrl: '', type:'기출문제' })
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[params.id])

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!flipbook) return <main style={{padding:'20px'}}>문제를 찾을 수 없습니다</main>

  // Mock pages - 실제로는 PDF를 이미지로 변환한 URL들
  const mockPages = Array.from({length: 10}, (_,i)=> ``)

  return (
    <main style={{padding:'20px', background:'#F8F9FB', minHeight:'100vh', paddingBottom:'100px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
        <a href="/learn" style={{background:'white', border:'1px solid #E5E7EB', borderRadius:'10px', padding:'8px 14px', textDecoration:'none', color:'#111827', fontWeight:700, fontSize:'13px'}}>← 학습으로</a>
        <div style={{fontWeight:800}}>{flipbook.category} - {flipbook.title}</div>
      </div>
      
      <FlipbookViewer 
        title={flipbook.title}
        pdfUrl={flipbook.fileUrl}
        pages={mockPages}
        allowDownload={true}
      />

      <div style={{marginTop:'20px', background:'white', borderRadius:'12px', padding:'16px'}}>
        <div style={{fontWeight:700, fontSize:'14px'}}>📚 {flipbook.title}</div>
        <div style={{fontSize:'12px', color:'#6B7280', marginTop:'6px'}}>분류: {flipbook.category} / {flipbook.type}</div>
        <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'8px', lineHeight:'1.6'}}>
          • 페이지를 클릭하거나 버튼으로 넘기세요<br/>
          • 페이지 넘길 때마다 종이 넘기는 소리가 납니다<br/>
          • 오른쪽 상단 PDF 다운 버튼으로 원본 PDF 다운로드 가능<br/>
          • 관리자가 업로드한 PDF는 자동으로 플립북으로 변환됩니다
        </div>
      </div>
    </main>
  )
}
