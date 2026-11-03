
'use client'
import { useEffect, useState } from 'react'

const ALL_CERTS = [
  {name:'전기기사', level:'기사', hot:true, desc:'300문제 보유 - 기사'},
  {name:'전기공사기사', level:'기사', hot:false, desc:'기사'},
  {name:'전기철도기사', level:'기사', hot:false, desc:'기사'},
  {name:'전기산업기사', level:'산업기사', hot:false, desc:'산업기사'},
  {name:'전기공사산업기사', level:'산업기사', hot:false, desc:'산업기사'},
  {name:'전기기능사', level:'기능사', hot:false, desc:'기능사'},
  {name:'전기공사기능사', level:'기능사', hot:false, desc:'기능사'},
  {name:'전기기능장', level:'기능장', hot:false, desc:'기능장'},
  {name:'건축전기설비기술사', level:'기술사', hot:false, desc:'기술사'},
  {name:'발송배전기술사', level:'기술사', hot:false, desc:'기술사'},
]

export default function LearnPage(){
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [selectedLevel, setSelectedLevel] = useState('전체')

  useEffect(()=>{
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setProblemTypes(d)
      else setProblemTypes([{id:'1', name:'기출문제', icon:'📜'}, {id:'2', name:'예상문제', icon:'⭐'}])
    }).catch(()=> setProblemTypes([{id:'1', name:'기출문제', icon:'📜'}, {id:'2', name:'예상문제', icon:'⭐'}]))
  },[])

  const levels = ['전체','기술사','기능장','기사','산업기사','기능사']
  const filteredCerts = ALL_CERTS.filter(c=> selectedLevel==='전체' || c.level===selectedLevel)

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'20px', fontWeight:800}}>📚 학습하기 - 전체 자격증 자동 연동</h1>
      <div style={{fontSize:'11px', color:'#6B7280', marginTop:'6px', background:'white', padding:'8px 12px', borderRadius:'8px'}}>
        MY에서 123회 생성 + 자격증별 PDF 업로드하면 모든 자격증에 자동 표시!<br/>
        예: 전기기능사 선택해서 123회 업로드 → 전기기능사 카드에 123회 버튼 자동 생성
      </div>
      
      <div style={{display:'flex', gap:'6px', marginTop:'12px', flexWrap:'wrap'}}>
        {levels.map(l=>(
          <button key={l} onClick={()=>setSelectedLevel(l)} style={{padding:'8px 14px', borderRadius:'20px', border:'1px solid #E5E7EB', background: selectedLevel===l ? '#111827' : 'white', color: selectedLevel===l ? 'white' : '#6B7280', fontSize:'12px', fontWeight:700}}>{l}</button>
        ))}
      </div>

      <div style={{marginTop:'20px'}}>
        {filteredCerts.map((cert:any)=>{
          const certFlipbooks = flipbooks.filter(f=> f.category===cert.name)
          return (
            <div key={cert.name} style={{background:'white', borderRadius:'16px', padding:'16px', marginBottom:'12px', border:'1px solid #F3F4F6'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:'14px', display:'flex', gap:'6px'}}>{cert.name} {cert.hot && <span style={{background:'#FFD60A', fontSize:'10px', padding:'2px 6px', borderRadius:'6px'}}>HOT</span>}</div>
                  <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{cert.desc} - {certFlipbooks.length}개 PDF</div>
                  <div style={{display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap'}}>
                    {/* 기본 */}
                    <button style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'#F8F9FB', fontSize:'11px', fontWeight:600}}>기출 {certFlipbooks.filter(f=>f.type==='기출문제').length}년</button>
                    <button style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'#F8F9FB', fontSize:'11px', fontWeight:600}}>예상 {certFlipbooks.filter(f=>f.type==='예상문제').length}제</button>
                    {/* MY에서 생성한 모든 유형 - 123회 등 - 자동으로 모든 자격증에! */}
                    {problemTypes.filter(t=> t.name!=='기출문제' && t.name!=='예상문제').map((t:any)=>{
                      const count = certFlipbooks.filter(f=> f.type===t.name).length
                      return (
                        <button key={t.id} style={{
                          padding:'6px 12px', borderRadius:'8px', 
                          border: count>0 ? '2px solid #FFD60A' : '1px solid #E5E7EB',
                          background: count>0 ? '#FFD60A' : '#FFFBEB', 
                          fontSize:'11px', fontWeight:700,
                        }}>
                          {t.icon} {t.name} ({count})
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={{width:'48px', height:'48px', background:'#F3F4F6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', marginLeft:'12px'}}>📘</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{background:'white', borderRadius:'12px', padding:'16px', marginTop:'12px'}}>
        <div style={{fontWeight:700, fontSize:'13px'}}>📋 전체 현황 - MY 생성 유형</div>
        <div style={{fontSize:'12px', marginTop:'8px', display:'flex', gap:'6px', flexWrap:'wrap'}}>
          {problemTypes.map(t=> <span key={t.id} style={{background:'#FFFBEB', border:'1px solid #FDE68A', padding:'6px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:600}}>{t.icon} {t.name}</span>)}
        </div>
        <div style={{fontSize:'11px', color:'#6B7280', marginTop:'12px', lineHeight:'1.6'}}>
          ✅ MY에서 "123회 예상문제" 생성<br/>
          ✅ MY에서 자격증 분류 "전기기능사" 선택 + 123회 유형 선택 + PDF 업로드<br/>
          ✅ → 학습 페이지 전기기능사 카드에 [123회 예상문제 (1)] 자동 표시<br/>
          ✅ 전기기사, 전기산업기사 등 다른 자격증도 각각 업로드하면 각각 표시<br/>
          ✅ 모든 자격증 자동으로 연동!
        </div>
      </div>
    </main>
  )
}
