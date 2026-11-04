
'use client'
import { DDAY_EXAMS } from '@/lib/subscription'

export default function DDayBanner({cert='전기기사'}){
  const exam = DDAY_EXAMS.find(e=> e.cert===cert) || DDAY_EXAMS[0]
  return (
    <div style={{background:'linear-gradient(135deg, #1a1a2e 0%, #2D2D5E 100%)', borderRadius:12, padding:14, color:'white', marginBottom:12, position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', top:-10, right:-10, width:60, height:60, background:'rgba(255,214,0,0.2)', borderRadius:30}}></div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative'}}>
        <div>
          <div style={{fontSize:11, color:'#FFD600', fontWeight:700}}>D-{exam.dday} {exam.cert} 시험</div>
          <div style={{fontSize:14, fontWeight:800, marginTop:2}}>{exam.title}</div>
          <div style={{fontSize:10, color:'rgba(255,255,255,0.7)', marginTop:2}}>3,000문제 다 풀면 합격 가능!</div>
        </div>
        <button onClick={()=>window.location.href='/payment?plan=PASS_GUARANTEE'} style={{padding:'8px 14px', background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:20, fontSize:11, fontWeight:800, color:'#1a1a2e', cursor:'pointer'}}>보장반 보기</button>
      </div>
    </div>
  )
}
