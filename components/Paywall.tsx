
'use client'
import { useState } from 'react'
import { PLANS } from '@/lib/subscription'

export default function Paywall({reason, onClose, feature}: {reason?:string, onClose?:()=>void, feature?:string}){
  const [selected, setSelected] = useState('YEARLY')

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16}}>
      <div style={{background:'white', borderRadius:20, padding:24, maxWidth:380, width:'100%', maxHeight:'90vh', overflowY:'auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div style={{fontSize:18, fontWeight:800}}>🔒 구독이 필요합니다</div>
          <button onClick={onClose} style={{background:'none', border:'none', fontSize:20, cursor:'pointer'}}>×</button>
        </div>

        {reason && <div style={{background:'#FFF9DB', border:'1px solid #FFE066', borderRadius:10, padding:12, fontSize:12, marginBottom:16, color:'#8B6914'}}>{reason}</div>}

        <div style={{background:'#F8F9FA', borderRadius:12, padding:12, marginBottom:16, textAlign:'center'}}>
          <div style={{fontSize:12, color:'#888'}}>현재 {feature||'이 기능'}은 유료 회원만</div>
          <div style={{fontSize:14, fontWeight:700, marginTop:4}}>구독하면 모든 문제 무제한!</div>
        </div>

        {Object.values(PLANS).filter((p:any)=> p.id!=='FREE').map((plan:any)=>(
          <button key={plan.id} onClick={()=>setSelected(plan.id)} style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:14, background: selected===plan.id ? '#FFF9DB' : 'white', border: selected===plan.id ? '2px solid #FFD600' : '1px solid #E9ECEF', borderRadius:12, marginBottom:8, cursor:'pointer', textAlign:'left'}}>
            <div>
              <div style={{fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:6}}>{plan.name} {plan.popular && <span style={{background:'#FFD600', padding:'2px 6px', borderRadius:8, fontSize:9}}>인기</span>} {plan.limit && <span style={{background:'#FF4444', color:'white', padding:'2px 6px', borderRadius:8, fontSize:9}}>한정 {plan.limit}명</span>}</div>
              <div style={{fontSize:11, color:'#888', marginTop:2}}>{plan.period} {plan.discount ? `${plan.discount}% 할인!` : ''}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:16, fontWeight:800, color:'#1a1a2e'}}>{plan.price.toLocaleString()}원</div>
              {plan.originalPrice && <div style={{fontSize:10, color:'#888', textDecoration:'line-through'}}>{plan.originalPrice.toLocaleString()}원</div>}
            </div>
          </button>
        ))}

        <button onClick={()=>window.location.href=`/payment?plan=${selected}`} style={{width:'100%', padding:14, background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:12, fontWeight:800, fontSize:14, cursor:'pointer', marginTop:8, boxShadow:'0 4px 12px rgba(255,214,0,0.3)'}}>
          {PLANS[selected as keyof typeof PLANS]?.price.toLocaleString()}원에 구독하기
        </button>

        <div style={{textAlign:'center', marginTop:12}}>
          <button onClick={onClose} style={{background:'none', border:'none', fontSize:12, color:'#888', cursor:'pointer', textDecoration:'underline'}}>나중에 할게요</button>
        </div>

        <div style={{background:'#F0F4FF', borderRadius:8, padding:10, marginTop:12, fontSize:10, color:'#3367D6'}}>
          <div>✓ 모든 자격증 문제 무제한</div>
          <div>✓ 오답노트 무제한 저장</div>
          <div>✓ PDF 교재 전체 보기</div>
          <div>✓ AI 분석 리포트 포함</div>
        </div>
      </div>
    </div>
  )
}
