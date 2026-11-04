
'use client'
export default function AIReportUpsell(){
  return (
    <div style={{background:'linear-gradient(135deg, #F0F4FF 0%, #E8F0FF 100%)', border:'1.5px solid #B6D0FF', borderRadius:12, padding:12, margin:'10px 0'}}>
      <div style={{fontSize:12, fontWeight:700, color:'#3367D6', marginBottom:4}}>🤖 AI가 찾은 당신의 약점</div>
      <div style={{fontSize:11, color:'#666', marginBottom:8}}>전기기기 60% 틀림 → 이 부분 집중 학습 필요!</div>
      <button onClick={()=>window.location.href='/payment?product=AI_REPORT'} style={{width:'100%', padding:'8px', background:'white', border:'1px solid #B6D0FF', borderRadius:8, fontSize:11, fontWeight:700, color:'#3367D6', cursor:'pointer'}}>AI 리포트 보기 - 4,900원 →</button>
    </div>
  )
}
