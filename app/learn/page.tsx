
'use client'
import { useEffect, useState } from 'react'

export default function LearnPage(){
  const [certs, setCerts] = useState<any[]>([])
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [selectedLevel, setSelectedLevel] = useState('전체')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/questions').then(r=>r.json()).then(d=>{
      const list = Array.isArray(d) ? d : d.certs || d.questions || []
      setCerts(list.slice(0,50))
    }).catch(()=>{})
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=>{
      setFlipbooks(Array.isArray(d) ? d : [])
    }).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setProblemTypes(d)
      else setProblemTypes([{id:'1', name:'기출문제', icon:'📜'}, {id:'2', name:'예상문제', icon:'⭐'}])
    }).catch(()=> setProblemTypes([{id:'1', name:'기출문제', icon:'📜'}, {id:'2', name:'예상문제', icon:'⭐'}]))
    setLoading(false)
  },[])

  const levels = ['전체','기술사','기능장','기사','산업기사','기능사']

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'20px', fontWeight:800}}>📚 학습하기</h1>
      
      <div style={{display:'flex', gap:'6px', marginTop:'12px', flexWrap:'wrap'}}>
        {levels.map(l=>(
          <button key={l} onClick={()=>setSelectedLevel(l)} style={{padding:'8px 14px', borderRadius:'20px', border:'1px solid #E5E7EB', background: selectedLevel===l ? '#111827' : 'white', color: selectedLevel===l ? 'white' : '#6B7280', fontSize:'12px', fontWeight:700}}>{l}</button>
        ))}
      </div>

      <div style={{marginTop:'20px'}}>
        {certs.length===0 ? (
          <div>
            {/* Demo cert cards - 전기기사 등 */}
            {[
              {name:'전기기사', hot:true, level:'기사', desc:'300문제 보유 - 기사', counts:{'기출 10년':10, '예상문제':300}},
              {name:'전기공사기사', hot:false, level:'기사', desc:'기사'},
              {name:'전기산업기사', hot:false, level:'산업기사', desc:'산업기사'},
              {name:'전기기능사', hot:false, level:'기능사', desc:'기능사'},
            ].map((cert:any)=>(
              <div key={cert.name} style={{background:'white', borderRadius:'16px', padding:'16px', marginBottom:'12px', border:'1px solid #F3F4F6'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:800, fontSize:'14px', display:'flex', gap:'6px', alignItems:'center'}}>{cert.name} {cert.hot && <span style={{background:'#FFD60A', fontSize:'10px', padding:'2px 6px', borderRadius:'6px'}}>HOT</span>}</div>
                    <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{cert.desc}</div>
                    <div style={{display:'flex', gap:'6px', marginTop:'8px', flexWrap:'wrap'}}>
                      {/* 기본 고정 + 동적 문제 유형들 - MY에서 생성한게 여기에! */}
                      <button style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'#F8F9FB', fontSize:'11px'}}>기출 {cert.counts?.['기출 10년']||10}년</button>
                      <button style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'#F8F9FB', fontSize:'11px'}}>예상문제</button>
                      {problemTypes.filter(t=> t.name!=='기출문제' && t.name!=='예상문제').map((t:any)=>{
                        const count = flipbooks.filter(f=> f.category===cert.name && f.type===t.name).length
                        return (
                          <button key={t.id} onClick={()=> setSelectedType(t.name)} style={{
                            padding:'6px 12px', borderRadius:'8px', border:'1px solid #FFD60A', 
                            background: selectedType===t.name ? '#FFD60A' : '#FFFBEB', 
                            fontSize:'11px', fontWeight:700,
                            display:'flex', gap:'4px', alignItems:'center'
                          }}>
                            {t.icon} {t.name} ({count})
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{width:'48px', height:'48px', background:'#F3F4F6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>📘</div>
                </div>
              </div>
            ))}

            <div style={{background:'#FFFBEB', borderRadius:'12px', padding:'12px', marginTop:'16px', border:'1px dashed #F59E0B'}}>
              <div style={{fontSize:'12px', fontWeight:700}}>💡 MY에서 생성한 문제 유형이 여기에 표시됩니다</div>
              <div style={{fontSize:'11px', color:'#92400E', marginTop:'6px'}}>
                현재 문제 유형: {problemTypes.map(t=>t.name).join(', ')}<br/>
                예: MY에서 "123회 예상문제" 생성 → 학습 페이지 전기기사 카드에<br/>
                [📁 123회 예상문제 (0)] 버튼이 기출 10년, 예상문제 옆에 자동 생성!
              </div>
              <div style={{display:'flex', gap:'6px', marginTop:'8px', flexWrap:'wrap'}}>
                {problemTypes.map(t=> <span key={t.id} style={{background:'white', border:'1px solid #FDE68A', padding:'4px 8px', borderRadius:'8px', fontSize:'11px'}}>{t.icon} {t.name}</span>)}
              </div>
            </div>
          </div>
        ) : (
          certs.map((c:any)=><div key={c.id} style={{background:'white', padding:'12px', marginBottom:'8px', borderRadius:'12px'}}>{c.name || c.title}</div>)
        )}
      </div>
    </main>
  )
}
