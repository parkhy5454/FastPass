
'use client'
import { useState, useEffect } from 'react'

const CATEGORIES = {
  '기술사': [
    { name: '발송배전기술사', code: '발송배전', count: 0, color:'#7C3AED' },
    { name: '건축전기설비기술사', code: '건축전기', count: 0, color:'#7C3AED' },
    { name: '전기응용기술사', code: '전기응용', count: 0, color:'#7C3AED' },
    { name: '전기철도기술사', code: '전기철도', count: 0, color:'#7C3AED' },
    { name: '전기안전기술사', code: '전기안전', count: 0, color:'#7C3AED' },
  ],
  '기능장': [
    { name: '전기기능장', code: '전기기능장', count: 0, color:'#DC2626' },
  ],
  '기사': [
    { name: '전기기사', code: '전기기사', count: 300, color:'#2563EB', hot:true },
    { name: '전기공사기사', code: '전기공사기사', count: 200, color:'#2563EB' },
    { name: '소방설비기사(전기)', code: '소방전기기사', count: 150, color:'#EA580C', hot:true },
  ],
  '산업기사': [
    { name: '전기산업기사', code: '전기산업기사', count: 250, color:'#059669', hot:true },
    { name: '전기공사산업기사', code: '전기공사산업기사', count: 180, color:'#059669' },
    { name: '소방설비산업기사(전기)', code: '소방전기산업기사', count: 120, color:'#EA580C' },
  ],
  '기능사': [
    { name: '전기기능사', code: '전기기능사', count: 300, color:'#4B5563', hot:true },
    { name: '전기공사기능사', code: '전기공사기능사', count: 100, color:'#4B5563' },
  ],
}

export default function LearnPage(){
  const [level, setLevel] = useState<keyof typeof CATEGORIES>('기사')
  const [selectedCert, setSelectedCert] = useState<string>('전기기사')
  const [questions, setQuestions] = useState<any[]>([])
  const [mode, setMode] = useState<'list'|'exam'|'wrong'>('list')

  useEffect(()=>{
    fetch(`/api/questions?category=${selectedCert}`).then(r=>r.json()).then(d=>{
      setQuestions(d.questions || d.sample || [])
    }).catch(()=>{})
  }, [selectedCert])

  return (
    <main style={{padding:'0 0 100px', background:'#F8F9FB', minHeight:'100vh'}}>
      {/* Header */}
      <div style={{background:'white', padding:'20px 20px 16px', position:'sticky', top:0, zIndex:10, boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
        <h1 style={{fontSize:'20px', fontWeight:800}}>📚 학습</h1>
        <div style={{fontSize:'12px', color:'#6B7280', marginTop:'2px'}}>원하는 자격증 레벨을 선택하세요</div>
        
        {/* 레벨 탭 - 5개 */}
        <div style={{display:'flex', gap:'6px', marginTop:'16px', overflowX:'auto'}}>
          {Object.keys(CATEGORIES).map((lvl)=>(
            <button key={lvl} onClick={()=>setLevel(lvl as any)} style={{
              padding:'10px 16px', borderRadius:'20px', border:'none', whiteSpace:'nowrap',
              fontSize:'13px', fontWeight:700, cursor:'pointer',
              background: level===lvl ? '#111827' : '#F3F4F6',
              color: level===lvl ? 'white' : '#6B7280'
            }}>
              {lvl}
              {lvl==='기사' && <span style={{marginLeft:'4px', fontSize:'10px', background: level===lvl ? '#FFD60A' : '#E5E7EB', color: level===lvl ? 'black' : '#6B7280', padding:'2px 6px', borderRadius:'10px'}}>인기</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 레벨의 자격증 목록 */}
      <div style={{padding:'16px 20px'}}>
        <div style={{fontSize:'14px', fontWeight:700, marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px'}}>
          <span style={{background:CATEGORIES[level][0].color, width:'4px', height:'16px', borderRadius:'2px', display:'inline-block'}}></span>
          {level} ({CATEGORIES[level].length}개)
        </div>
        
        <div style={{display:'grid', gap:'10px'}}>
          {CATEGORIES[level].map((cert)=>(
            <button key={cert.name} onClick={()=>setSelectedCert(cert.name)} style={{
              background:'white', border: selectedCert===cert.name ? `2px solid ${cert.color}` : '1px solid #F3F4F6',
              borderRadius:'16px', padding:'16px', textAlign:'left', cursor:'pointer',
              boxShadow: selectedCert===cert.name ? `0 4px 12px ${cert.color}20` : '0 1px 3px rgba(0,0,0,0.04)',
              position:'relative'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontWeight:800, fontSize:'15px', display:'flex', alignItems:'center', gap:'6px'}}>
                    {cert.name}
                    {cert.hot && <span style={{background:'#FFD60A', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>HOT</span>}
                  </div>
                  <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>
                    {cert.count>0 ? `${cert.count}문제 보유` : '문제 준비중'} • {level}
                  </div>
                  <div style={{marginTop:'8px', display:'flex', gap:'4px'}}>
                    <span style={{fontSize:'10px', background:'#F3F4F6', padding:'3px 8px', borderRadius:'8px'}}>기출 10년</span>
                    <span style={{fontSize:'10px', background:'#F3F4F6', padding:'3px 8px', borderRadius:'8px'}}>예상문제</span>
                    <span style={{fontSize:'10px', background:'#F3F4F6', padding:'3px 8px', borderRadius:'8px'}}>OMR</span>
                  </div>
                </div>
                <div style={{
                  width:'40px', height:'40px', borderRadius:'12px', background: `${cert.color}15`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'
                }}>
                  {level==='기술사'?'🎓': level==='기능장'?'👑': level==='기사'?'📘': level==='산업기사'?'📗':'📙'}
                </div>
              </div>
              {selectedCert===cert.name && (
                <div style={{marginTop:'12px', display:'flex', gap:'6px'}}>
                  <button onClick={(e)=>{e.stopPropagation(); setMode('exam'); location.href=`/learn/exam?cert=${encodeURIComponent(cert.name)}`}} style={{flex:1, background:cert.color, color:'white', border:'none', padding:'10px', borderRadius:'10px', fontSize:'12px', fontWeight:700}}>모의고사</button>
                  <button onClick={(e)=>{e.stopPropagation(); setMode('list'); location.href=`/learn/list?cert=${encodeURIComponent(cert.name)}`}} style={{flex:1, background:'#F3F4F6', border:'none', padding:'10px', borderRadius:'10px', fontSize:'12px', fontWeight:700}}>문제풀기</button>
                  <button onClick={(e)=>{e.stopPropagation(); location.href=`/learn/wrong?cert=${encodeURIComponent(cert.name)}`}} style={{flex:1, background:'#FFF7CC', border:'none', padding:'10px', borderRadius:'10px', fontSize:'12px', fontWeight:700}}>오답노트</button>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 현재 선택된 자격증 학습 현황 */}
        <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'16px'}}>
          <div style={{fontWeight:700, fontSize:'14px'}}>📊 {selectedCert} 학습 현황</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginTop:'12px'}}>
            <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'12px', textAlign:'center'}}>
              <div style={{fontSize:'18px', fontWeight:800}}>{questions.length || CATEGORIES[level].find(c=>c.name===selectedCert)?.count || 0}</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>총 문제</div>
            </div>
            <div style={{background:'#F0FDF4', borderRadius:'10px', padding:'12px', textAlign:'center'}}>
              <div style={{fontSize:'18px', fontWeight:800, color:'#059669'}}>0</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>푼 문제</div>
            </div>
            <div style={{background:'#FEF2F2', borderRadius:'10px', padding:'12px', textAlign:'center'}}>
              <div style={{fontSize:'18px', fontWeight:800, color:'#DC2626'}}>0</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>오답</div>
            </div>
          </div>
          <div style={{marginTop:'12px', display:'flex', gap:'8px'}}>
            <button onClick={()=>location.href=`/learn/exam?cert=${encodeURIComponent(selectedCert)}`} style={{flex:2, background:'#111827', color:'white', border:'none', padding:'14px', borderRadius:'12px', fontWeight:700, fontSize:'14px', cursor:'pointer'}}>🎯 모의고사 시작</button>
            <button onClick={()=>location.href=`/learn/list?cert=${encodeURIComponent(selectedCert)}`} style={{flex:1, background:'#FFD60A', border:'none', padding:'14px', borderRadius:'12px', fontWeight:800, fontSize:'14px', cursor:'pointer'}}>문제풀기</button>
          </div>
        </div>

        {/* 전체 로드맵 */}
        <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'12px'}}>
          <div style={{fontWeight:700, fontSize:'14px'}}>🗺️ 전기 자격증 로드맵</div>
          <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'4px'}}>기능사부터 기술사까지 단계별 성장</div>
          <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'12px', overflowX:'auto'}}>
            {['기능사','산업기사','기사','기능장','기술사'].map((lvl, i)=>(
              <div key={lvl} style={{display:'flex', alignItems:'center', gap:'4px'}}>
                <div style={{
                  background: level===lvl ? '#111827' : '#F3F4F6',
                  color: level===lvl ? 'white' : '#6B7280',
                  padding:'6px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700, whiteSpace:'nowrap'
                }}>{lvl}</div>
                {i<4 && <div style={{color:'#D1D5DB'}}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
