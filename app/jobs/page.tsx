
'use client'
export default function JobsPage(){
  const jobs = [
    { type:'구인', company:'한전KPS', title:'전기설비 기술자 모집', location:'경기 성남', cert:'전기기사', salary:'4000만원~' },
    { type:'구인', company:'삼성물산', title:'건축전기 경력직', location:'서울 강남', cert:'건축전기설비기술사', salary:'협의' },
    { type:'구직', company:'개인', title:'전기산업기사 보유, 구직 희망', location:'남양주', cert:'전기산업기사', salary:'' },
  ]
  return (
    <main style={{padding:'20px'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, margin:'8px 0 16px'}}>💼 취업</h1>
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        <button style={{background:'#111827', color:'white', borderRadius:'20px', padding:'8px 16px', border:'none', fontSize:'13px', fontWeight:700}}>전체</button>
        <button style={{background:'white', borderRadius:'20px', padding:'8px 16px', border:'1px solid #E5E7EB', fontSize:'13px'}}>구인</button>
        <button style={{background:'white', borderRadius:'20px', padding:'8px 16px', border:'1px solid #E5E7EB', fontSize:'13px'}}>구직</button>
      </div>
      <div style={{display:'grid', gap:'10px'}}>
        {jobs.map((j,i)=>(
          <div key={i} style={{background:'white', borderRadius:'16px', padding:'16px', border:'1px solid #F3F4F6'}}>
            <div style={{display:'flex', gap:'8px', alignItems:'center'}}><span style={{background: j.type==='구인'?'#E0F2FE':'#FFF7CC', padding:'2px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:700}}>{j.type}</span><span style={{fontSize:'12px', color:'#6B7280'}}>{j.company}</span></div>
            <div style={{fontWeight:700, marginTop:'8px'}}>{j.title}</div>
            <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{j.location} · {j.cert} · {j.salary}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
