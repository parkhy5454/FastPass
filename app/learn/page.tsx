
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUAL_FAMILIES: Record<string, string[]> = {
  '전기': ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사'],
  '토목': ['토목기사','토목산업기사','측량및지형공간정보기사','건설안전기사'],
  '건축': ['건축기사','건축산업기사'],
  '기계': ['기계기사','기계설계기사','일반기계기사'],
  '정보통신': ['정보처리기사','정보통신기사'],
}

type ProblemType = { id:string, qual:string, name:string, count?:number, createdAt?:string }

export default function LearnPage(){
  const [user,setUser]=useState<any>(null)
  const [selectedQual,setSelectedQual]=useState('전기기사')
  const [selectedType,setSelectedType]=useState('전체')
  const [problemTypes,setProblemTypes]=useState<ProblemType[]>([])
  const [pdfs,setPdfs]=useState<any[]>([])
  const [error,setError]=useState('')
  const router=useRouter()

  useEffect(()=>{
    try{
      fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json()).then(d=>{
        if(d.user) setUser(d.user)
      }).catch(()=>{})
    }catch(e){ console.error(e) }
    loadProblemTypes()
    loadPdfs()

    const handler = () => { loadProblemTypes(); loadPdfs() }
    window.addEventListener('problemTypesUpdated', handler)
    window.addEventListener('storage', handler)
    return ()=> {
      window.removeEventListener('problemTypesUpdated', handler)
      window.removeEventListener('storage', handler)
    }
  },[])

  useEffect(()=>{ loadPdfs() },[selectedQual, selectedType])

  function loadProblemTypes(){
    try{
      const raw = localStorage.getItem('problemTypes')
      if(raw){
        const parsed = JSON.parse(raw)
        if(Array.isArray(parsed)){
          setProblemTypes(parsed)
          return
        }
      }
    }catch(e){
      console.error('problemTypes parse error', e)
      setProblemTypes([])
    }
    // Fallback API
    fetch('/api/problem-types').then(r=>r.json()).then(data=>{
      if(data.problemTypes && Array.isArray(data.problemTypes)){
        setProblemTypes(data.problemTypes)
        try{ localStorage.setItem('problemTypes', JSON.stringify(data.problemTypes)) }catch{}
      }
    }).catch(()=> setProblemTypes([]))
  }

  async function loadPdfs(){
    try{
      const url = selectedType==='전체' ? `/api/pdfs?qual=${encodeURIComponent(selectedQual)}` : `/api/pdfs?qual=${encodeURIComponent(selectedQual)}&type=${encodeURIComponent(selectedType)}`
      const res = await fetch(url,{credentials:'include'})
      const data = await res.json()
      setPdfs(data.pdfs||[])
    }catch(e){ setPdfs([]) }
  }

  const allQuals = (()=>{ try{ return Object.values(QUAL_FAMILIES).flat() }catch{ return ['전기기사'] } })()
  const typesForQual = (()=>{ try{ return problemTypes.filter(t=> t && t.qual===selectedQual) }catch{ return [] } })()

  const defaultTypes: ProblemType[] = [
    {id:'default_10y', qual:selectedQual, name:'기출 10년', count:300},
    {id:'default_expected', qual:selectedQual, name:'예상문제', count:300},
  ]

  const displayTypes = typesForQual.length>0 ? typesForQual : defaultTypes

  const safeSelectedQual = selectedQual || '전기기사'

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:12}}>학습</div>

        {error && <div style={{background:'#FFF1F1', color:'#E5484D', padding:10, borderRadius:8, fontSize:12, marginBottom:12}}>{error}</div>}

        <div style={{background:'white', borderRadius:16, padding:12, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>자격증 선택</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, maxHeight:100, overflowY:'auto'}}>
            {allQuals.slice(0,30).map(q=> (
              <button key={q} onClick={()=> { setSelectedQual(q); setSelectedType('전체') }} style={{padding:'6px 10px', background: selectedQual===q ? '#1a1a2e' : 'white', color: selectedQual===q ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, fontWeight: selectedQual===q ? 700 : 400, cursor:'pointer'}}>
                {q}
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:12, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, marginBottom:8, display:'flex', justifyContent:'space-between'}}>
            <span>{safeSelectedQual} - 문제 유형 ({typesForQual.length>0 ? `${typesForQual.length}개 연동` : '기본'})</span>
            <button onClick={()=> { loadProblemTypes(); loadPdfs() }} style={{fontSize:10, background:'#F5F5F5', border:'1px solid #E9ECEF', borderRadius:6, padding:'2px 6px', cursor:'pointer'}}>새로고침</button>
          </div>

          <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:4}}>
            <button onClick={()=> setSelectedType('전체')} style={{whiteSpace:'nowrap', padding:'8px 12px', background: selectedType==='전체' ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: '#1a1a2e', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer'}}>전체</button>
            {displayTypes.map(t=> (
              <button key={t.id} onClick={()=> setSelectedType(t.name)} style={{whiteSpace:'nowrap', padding:'8px 12px', background: selectedType===t.name ? '#1a1a2e' : 'white', color: selectedType===t.name ? 'white' : '#333', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer'}}>
                {t.name} {t.count ? `(${t.count})` : ''}
              </button>
            ))}
          </div>

          <div style={{marginTop:10, background: typesForQual.length>0 ? '#E8F5E9' : '#FFF3CD', borderRadius:8, padding:'8px 10px', fontSize:10, color: typesForQual.length>0 ? '#2E7D32' : '#856404'}}>
            {typesForQual.length>0 ? `✓ MY에서 생성한 ${typesForQual.length}개 폴더가 연동됨: ${typesForQual.map(t=> t.name).join(', ')}` : `💡 MY 페이지 → 자격증 폴더에서 "${safeSelectedQual} - 2022년 2회 기출문제" 생성하면 여기에 자동 표시!`}
          </div>

          <div style={{marginTop:12, display:'flex', gap:8}}>
            <div style={{flex:1, background:'#F8F9FA', borderRadius:12, padding:12, border:'1px solid #EEF2F7'}}>
              <div style={{fontSize:11, color:'#888'}}>{typesForQual.reduce((sum,t)=> sum+(t.count||0),0) || 300}문제 보유 • 기사</div>
              <div style={{display:'flex', gap:6, marginTop:8, flexWrap:'wrap'}}>
                {displayTypes.slice(0,4).map(t=> (
                  <span key={t.id} style={{fontSize:11, background:'white', border: selectedType===t.name ? '1.5px solid #FFD600' : '1px solid #E9ECEF', padding:'4px 8px', borderRadius:16, fontWeight: selectedType===t.name ? 700 : 400}}>{t.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:12, border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>{safeSelectedQual} - {selectedType} ({pdfs.length}개)</div>
          {pdfs.length===0 ? (
            <div style={{padding:30, textAlign:'center', color:'#888', fontSize:12}}>
              등록된 PDF가 없습니다<br/>
              <div style={{fontSize:11, marginTop:8}}>MY 페이지에서 PDF를 업로드하세요</div>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {pdfs.map((pdf:any, i:number)=> (
                <div key={i} onClick={()=> router.push(`/flipbook/${pdf.id}`)} style={{padding:'12px', background:'#F8F9FA', borderRadius:10, border:'1px solid #EEF2F7', cursor:'pointer', display:'flex', justifyContent:'space-between'}}>
                  <div><div style={{fontSize:12, fontWeight:600}}>📄 {pdf.title||pdf.fileName}</div><div style={{fontSize:10, color:'#888'}}>{pdf.problemType||selectedType}</div></div>
                  <div style={{fontSize:11, background:'#FFD600', padding:'4px 8px', borderRadius:8, fontWeight:700}}>보기</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
