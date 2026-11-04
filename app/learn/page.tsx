
'use client'
import { useEffect, useState } from 'react'

const DEFAULT_TYPES = [
  {name:'기출 10년', category:'전기기사'},
  {name:'예상문제', category:'전기기사'},
]

const QUALIFICATIONS = ['전기기사', '전기산업기사', '전기공사기사', '토목기사', '건축기사', '정보통신기사']

export default function LearnPage(){
  const [selectedQual, setSelectedQual] = useState('전기기사')
  const [selectedType, setSelectedType] = useState('기출 10년')
  const [problemTypes, setProblemTypes] = useState<any[]>(DEFAULT_TYPES)
  const [flipbooks, setFlipbooks] = useState<any[]>([])

  useEffect(()=>{
    loadTypes()
    // Listen for updates from MY page
    window.addEventListener('problemTypesUpdated', loadTypes)
    window.addEventListener('storage', loadTypes)
    return ()=>{
      window.removeEventListener('problemTypesUpdated', loadTypes)
      window.removeEventListener('storage', loadTypes)
    }
  },[])

  useEffect(()=>{
    loadTypes()
  }, [selectedQual])

  function loadTypes(){
    try{
      const saved = JSON.parse(localStorage.getItem('problemTypes')||'[]')
      const filtered = saved.filter((t:any)=> t.category===selectedQual)
      // Merge defaults + custom
      const defaults = DEFAULT_TYPES.filter(d=> d.category===selectedQual || d.category==='전기기사')
      const all = [...defaults]
      filtered.forEach((t:any)=>{
        if(!all.find(a=> a.name===t.name)){
          all.push(t)
        }
      })
      // Also include types that match this qual from any category if qual matches
      saved.forEach((t:any)=>{
        if(t.category===selectedQual && !all.find(a=> a.name===t.name)){
          all.push(t)
        }
      })
      setProblemTypes(all.length>0 ? all : DEFAULT_TYPES)
    }catch{
      setProblemTypes(DEFAULT_TYPES)
    }

    // Load flipbooks
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=>{
      if(d.flipbooks){
        setFlipbooks(d.flipbooks.filter((f:any)=> f.category===selectedQual))
      }
    }).catch(()=>{})
  }

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:16, color:'#1a1a2e'}}>학습</div>

        {/* 자격증 선택 */}
        <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:12, paddingBottom:4}}>
          {QUALIFICATIONS.map(q=>(
            <button key={q} onClick={()=>{ setSelectedQual(q); setSelectedType('기출 10년') }} style={{padding:'8px 14px', background: selectedQual===q ? '#1a1a2e' : 'white', color: selectedQual===q ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap'}}>{q}</button>
          ))}
        </div>

        {/* 문제 유형 - 동적 버튼! */}
        <div style={{background:'white', borderRadius:12, padding:12, marginBottom:12, border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8, color:'#1a1a2e'}}>{selectedQual} 문제 유형</div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {problemTypes.map((t:any)=>(
              <button 
                key={t.name} 
                onClick={()=>setSelectedType(t.name)}
                style={{
                  padding:'8px 14px', 
                  background: selectedType===t.name ? '#FFD600' : '#F1F3F5', 
                  color: selectedType===t.name ? '#1a1a2e' : '#666', 
                  border: selectedType===t.name ? 'none' : '1px solid #E9ECEF', 
                  borderRadius:20, 
                  fontSize:12, 
                  fontWeight: selectedType===t.name ? 700 : 500, 
                  cursor:'pointer',
                  display:'flex', alignItems:'center', gap:4
                }}
              >
                {t.name.includes('기출') ? '📄' : t.name.includes('예상') ? '⭐' : t.name.includes('회') ? '📝' : '📚'} {t.name}
              </button>
            ))}
          </div>
          <div style={{fontSize:10, color:'#888', marginTop:8}}>
            💡 MY → PDF 관리에서 "{selectedQual}" 카테고리로 새 유형을 생성하면 여기에 나타납니다!
          </div>
        </div>

        {/* 선택된 유형의 PDF 목록 */}
        <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:13, fontWeight:700, marginBottom:12, color:'#1a1a2e'}}>
            {selectedQual} - {selectedType} ({flipbooks.filter(f=> selectedType==='기출 10년' ? f.type?.includes('기출') : f.type===selectedType || f.type?.includes(selectedType)).length}개)
          </div>

          {flipbooks.filter(f=> selectedType==='기출 10년' ? f.type?.includes('기출') : f.type===selectedType || f.type?.includes(selectedType)).map((f:any)=>(
            <div key={f.id} style={{padding:'12px', background:'#F8F9FA', borderRadius:8, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:12, fontWeight:600, color:'#1a1a2e'}}>{f.title}</div>
                <div style={{fontSize:10, color:'#888', marginTop:2}}>{f.category} • {f.type}</div>
              </div>
              <button onClick={()=>window.open(f.url||f.pdfUrl, '_blank')} style={{padding:'6px 12px', background:'#FFD600', border:'none', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer'}}>보기</button>
            </div>
          ))}

          {flipbooks.filter(f=> selectedType==='기출 10년' ? f.type?.includes('기출') : f.type===selectedType || f.type?.includes(selectedType)).length===0 && (
            <div style={{textAlign:'center', padding:24, color:'#888'}}>
              <div style={{fontSize:24, marginBottom:8}}>📚</div>
              <div style={{fontSize:12}}>{selectedQual} - {selectedType} 문제집이 없습니다</div>
              <div style={{fontSize:10, marginTop:4}}>MY 페이지에서 PDF를 업로드해보세요</div>
              {selectedType.includes('회') && <div style={{fontSize:11, marginTop:8, background:'#FFF9DB', padding:8, borderRadius:8, color:'#8B6914'}}>💡 "{selectedType}" 유형이 생성되었습니다! PDF를 업로드하면 여기에 나타납니다</div>}
            </div>
          )}
        </div>

        {/* 전체 동적 유형 표시 (디버그용) */}
        <div style={{marginTop:12, background:'white', borderRadius:12, padding:12, border:'1px dashed #E9ECEF'}}>
          <div style={{fontSize:11, fontWeight:700, color:'#888', marginBottom:8}}>📌 현재 생성된 모든 유형 (localStorage)</div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {(() => {
              try{
                const all = JSON.parse(localStorage.getItem('problemTypes')||'[]')
                return all.map((t:any, i:number)=>(
                  <span key={i} style={{fontSize:10, background:'#F1F3F5', padding:'4px 8px', borderRadius:12, border:'1px solid #E9ECEF'}}>{t.category}: {t.name}</span>
                ))
              }catch{ return <span style={{fontSize:10, color:'#888'}}>없음</span> }
            })()}
            {problemTypes.length<=2 && <span style={{fontSize:10, color:'#888'}}>기본 유형만 있음 - MY에서 생성해보세요</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
