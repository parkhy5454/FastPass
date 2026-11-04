
'use client'
import { useEffect, useState } from 'react'

export default function AdsBanner({userPlan}: {userPlan?: string}){
  const [isFree, setIsFree] = useState(true)

  useEffect(()=>{
    // Check if user is free
    if(userPlan && userPlan !== 'FREE') setIsFree(false)
    else{
      fetch('/api/auth/me').then(r=>r.json()).then(d=>{
        if(d.user && d.user.plan && d.user.plan !== 'FREE') setIsFree(false)
      }).catch(()=>{})
    }
  },[userPlan])

  if(!isFree) return null // 유료 회원은 광고 없음

  return (
    <div style={{background:'#F8F9FA', border:'1px dashed #E9ECEF', borderRadius:12, padding:12, margin:'12px 0', textAlign:'center'}}>
      <div style={{fontSize:10, color:'#AAA', marginBottom:6}}>광고 - 구독하면 광고 제거</div>
      <div style={{background:'white', borderRadius:8, padding:16, fontSize:12, color:'#888'}}>
        <div style={{fontSize:14, fontWeight:700, color:'#1a1a2e', marginBottom:4}}>🎯 전기기사 합격률 300% 높이는 방법</div>
        <div>월 9,900원으로 모든 문제 무제한!</div>
        <button onClick={()=>window.location.href='/payment?plan=MONTHLY'} style={{marginTop:8, padding:'6px 14px', background:'#FFD600', border:'none', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer'}}>구독하기 →</button>
      </div>
    </div>
  )
}
