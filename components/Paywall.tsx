
'use client'
import { useState, useEffect } from 'react'
import { PLANS, calculatePointsUsage } from '@/lib/subscription'

export default function Paywall({reason, onClose, feature, solvedCount=3}: {reason?:string, onClose?:()=>void, feature?:string, solvedCount?:number}){
  const [selected, setSelected] = useState('YEARLY')
  const [timeLeft, setTimeLeft] = useState({h:23, m:59, s:59})

  useEffect(()=>{
    const timer = setInterval(()=>{
      const now = new Date()
      const end = new Date()
      end.setHours(23,59,59,999)
      const diff = end.getTime() - now.getTime()
      if(diff>0){
        setTimeLeft({h: Math.floor(diff/(1000*60*60)), m: Math.floor((diff%(1000*60*60))/(1000*60)), s: Math.floor((diff%(1000*60))/1000)})
      }
    },1000)
    return ()=> clearInterval(timer)
  },[])

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16}}>
      <div style={{background:'white', borderRadius:20, padding:20, maxWidth:380, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={{fontSize:18, fontWeight:800}}>🔒 {solvedCount}문제 다 풀었어요!</div>
          <button onClick={onClose} style={{background:'#F1F3F5', border:'none', fontSize:16, cursor:'pointer', width:28, height:28, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
        </div>

        <div style={{background:'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)', borderRadius:12, padding:10, textAlign:'center', color:'white', marginBottom:12, fontWeight:700, fontSize:12}}>
          ⏰ 첫 결제 50% 할인! {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')} 남음
        </div>

        {reason && <div style={{background:'#FFF9DB', border:'1px solid #FFE066', borderRadius:10, padding:10, fontSize:11, marginBottom:12, color:'#8B6914', fontWeight:600}}>{reason}</div>}

        <div style={{background:'#F0F4FF', borderRadius:12, padding:12, marginBottom:14, textAlign:'center'}}>
          <div style={{fontSize:11, color:'#3367D6'}}>현재 {feature||'이 기능'}은 유료 회원만</div>
          <div style={{fontSize:13, fontWeight:800, marginTop:2, color:'#1a1a2e'}}>구독하면 2,997문제 무제한! + 합격률 300%↑</div>
          <div style={{fontSize:10, color:'#888', marginTop:4}}>1,234명이 구독 중! ⭐ 4.8점</div>
        </div>

        {Object.values(PLANS).filter((p:any)=> p.id!=='FREE').slice(0,3).map((plan:any)=>(
          <button key={plan.id} onClick={()=>setSelected(plan.id)} style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, background: selected===plan.id ? '#FFF9DB' : 'white', border: selected===plan.id ? '2.5px solid #FFD600' : '1px solid #E9ECEF', borderRadius:12, marginBottom:8, cursor:'pointer', textAlign:'left', boxShadow: selected===plan.id ? '0 3px 12px rgba(255,214,0,0.3)' : 'none'}}>
            <div>
              <div style={{fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:4}}>{plan.name} {plan.best && <span style={{background:'#FF4444', color:'white', padding:'2px 6px', borderRadius:8, fontSize:8}}>BEST</span>} {plan.popular && <span style={{background:'#FFD600', padding:'2px 6px', borderRadius:8, fontSize:8}}>인기</span>} {plan.left && <span style={{background:'#FFE0E0', color:'#C53030', padding:'2px 6px', borderRadius:8, fontSize:8}}>{plan.left}명 남음</span>}</div>
              <div style={{fontSize:10, color:'#888', marginTop:1}}>{plan.period} {plan.discount ? `${plan.discount}% 할인!` : ''} {plan.desc && `• ${plan.desc}`}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:15, fontWeight:800, color:'#1a1a2e'}}>{plan.price.toLocaleString()}원</div>
              {plan.originalPrice && <div style={{fontSize:9, color:'#888', textDecoration:'line-through'}}>{plan.originalPrice.toLocaleString()}원</div>}
            </div>
          </button>
        ))}

        <button onClick={()=>window.location.href=`/payment?plan=${selected}`} style={{width:'100%', padding:14, background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:12, fontWeight:800, fontSize:14, cursor:'pointer', marginTop:6, boxShadow:'0 4px 16px rgba(255,214,0,0.4)'}}>
          {PLANS[selected as keyof typeof PLANS]?.price.toLocaleString()}원에 시작하기 →
        </button>

        <div style={{display:'flex', gap:6, marginTop:10}}>
          <div style={{flex:1, background:'#F8F9FA', borderRadius:8, padding:8, textAlign:'center', fontSize:9}}>✓ 전 문제 무제한</div>
          <div style={{flex:1, background:'#F8F9FA', borderRadius:8, padding:8, textAlign:'center', fontSize:9}}>✓ 오답 무제한</div>
          <div style={{flex:1, background:'#F8F9FA', borderRadius:8, padding:8, textAlign:'center', fontSize:9}}>✓ PDF 전체</div>
        </div>

        <div style={{textAlign:'center', marginTop:10}}>
          <button onClick={onClose} style={{background:'none', border:'none', fontSize:11, color:'#888', cursor:'pointer', textDecoration:'underline'}}>나중에 할게요 (할인 놓칠 수 있어요)</button>
        </div>
      </div>
    </div>
  )
}
