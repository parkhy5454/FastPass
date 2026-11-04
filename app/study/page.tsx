
'use client'
export default function StudyPage(){
  const items = [
    { title:'전기기사 기출 10년치', desc:'5과목 x 20문항 = 100문항', price:'98,900원', tag:'인기', color:'#FFF7CC' },
    { title:'전기산업기사 예상 300제', desc:'2025년 2회차 적중률 87%', price:'19,900원/월', tag:'NEW', color:'#E0F2FE' },
    { title:'건축전기설비기술사', desc:'논문형 + 구술 대비', price:'149,000원', tag:'올패스', color:'#F3E8FF' },
    { title:'오답노트', desc:'망각곡선 3/7/15일 복습', price:'무료', tag:'내것', color:'#F3F4F6' },
  ]
  return (
    <main style={{padding:'20px'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, margin:'8px 0 16px'}}>📚 학습</h1>
      <div style={{display:'grid', gap:'12px'}}>
        {items.map((it,i)=>(
          <div key={i} style={{background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', border:'1px solid #F3F4F6'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{background:it.color, padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700}}>{it.tag}</div>
              <div style={{fontSize:'13px', fontWeight:700, color:'#111827'}}>{it.price}</div>
            </div>
            <div style={{fontWeight:700, marginTop:'10px', fontSize:'16px'}}>{it.title}</div>
            <div style={{fontSize:'13px', color:'#6B7280', marginTop:'4px'}}>{it.desc}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
