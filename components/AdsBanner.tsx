
'use client'
import { useEffect, useState } from 'react'

export default function AdsBanner({userPlan}: {userPlan?: string}){
  const [isFree, setIsFree] = useState(true)
  useEffect(()=>{
    if(userPlan && userPlan !== 'FREE') setIsFree(false)
    else{
      fetch('/api/auth/me').then(r=>r.json()).then(d=>{
        if(d.user && d.user.plan && d.user.plan !== 'FREE') setIsFree(false)
      }).catch(()=>{})
    }
  },[userPlan])
  if(!isFree) return null
  return (
    <div style={{background:'#F8F9FA', border:'1px dashed #E9ECEF', borderRadius:12, padding:10, margin:'10px 0', textAlign:'center'}}>
      <div style={{fontSize:9, color:'#AAA', marginBottom:4}}>광고 - 구독하면 광고 제거 • 월 9,900원</div>
      <div style={{background:'white', borderRadius:10, padding:12, border:'1px solid #EEF2F7'}}>
        <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:2}}>🎯 전기기사 합격률 300% 높이는 방법</div>
        <div style={{fontSize:11, color:'#666'}}>월 9,900원으로 2,997문제 무제한! 1,234명 구독 중</div>
        <button onClick={()=>window.location.href='/payment?plan=YEARLY'} style={{marginTop:8, padding:'6px 14px', background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(255,214,0,0.3)'}}>50% 할인 받기 →</button>
      </div>
    </div>
  )
}
