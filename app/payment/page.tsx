
'use client'
import { useState, useEffect } from 'react'
import { PLANS, PRODUCTS, calculatePointsUsage } from '@/lib/subscription'

export default function PaymentPage(){
  const [plan, setPlan] = useState('YEARLY')
  const [points, setPoints] = useState(0)
  const [usePoints, setUsePoints] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{
    const url = new URL(window.location.href)
    const p = url.searchParams.get('plan')
    if(p) setPlan(p)
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ if(d.user){ setUser(d.user); setPoints(d.user.points||0) } }).catch(()=>{})
    fetch('/api/referral/stats').then(r=>r.json()).then(d=> setPoints(d.points||0)).catch(()=>{})
  },[])

  const selectedPlan = PLANS[plan as keyof typeof PLANS] || PLANS.YEARLY
  const price = (selectedPlan as any).price || 0
  const {usable, payAmount} = calculatePointsUsage(price, points)

  async function handlePay(){
    const finalPoints = Math.min(usePoints, usable)
    const finalPay = price - finalPoints

    // Verify payment
    try{
      const idempotencyKey = `${user?.id||'anon'}-${plan}-${Date.now()}`
      const res = await fetch('/api/payments/verify', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({amount: finalPay, productId: plan, idempotencyKey, paymentMethod:'card', pointsUsed: finalPoints, totalPrice: price})
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)

      // Mock payment success - in real, redirect to Toss/KakaoPay
      alert(`${selectedPlan.name} 결제 완료! ${finalPay.toLocaleString()}원 결제 (포인트 ${finalPoints}P 사용)`)

      // Update user plan
      await fetch('/api/admin/update-plan', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({plan, userId: user?.id})
      }).catch(()=>{})

      window.location.href = '/my'

    }catch(e:any){
      alert('결제 실패: '+e.message)
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{fontSize:20, fontWeight:800, marginBottom:16}}>결제하기</div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:14, fontWeight:700, marginBottom:12}}>구독 플랜</div>
          {Object.values(PLANS).filter((p:any)=> p.id!=='FREE').map((p:any)=>(
            <button key={p.id} onClick={()=>setPlan(p.id)} style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:14, background: plan===p.id ? '#FFF9DB' : 'white', border: plan===p.id ? '2px solid #FFD600' : '1px solid #E9ECEF', borderRadius:12, marginBottom:8, cursor:'pointer', textAlign:'left'}}>
              <div>
                <div style={{fontSize:14, fontWeight:700}}>{p.name} {p.popular && <span style={{background:'#FFD600', padding:'2px 6px', borderRadius:8, fontSize:9}}>인기</span>}</div>
                <div style={{fontSize:11, color:'#888'}}>{p.period} {p.discount ? `${p.discount}% 할인` : ''}</div>
              </div>
              <div style={{fontSize:16, fontWeight:800}}>{p.price.toLocaleString()}원</div>
            </button>
          ))}
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:14, fontWeight:700, marginBottom:12}}>포인트 사용</div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8}}><span>보유 포인트</span><span style={{fontWeight:700, color:'#E91E63'}}>{points.toLocaleString()}P</span></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8}}><span>최대 사용 가능 (30%)</span><span>{usable.toLocaleString()}P</span></div>
          <input type='range' min={0} max={usable} value={usePoints} onChange={e=>setUsePoints(Number(e.target.value))} style={{width:'100%', margin:'12px 0'}} />
          <div style={{display:'flex', gap:8}}>
            <input type='number' value={usePoints} onChange={e=>setUsePoints(Math.min(Number(e.target.value), usable))} style={{flex:1, padding:10, border:'1px solid #E9ECEF', borderRadius:8, fontSize:12}} placeholder='사용 포인트' />
            <button onClick={()=>setUsePoints(usable)} style={{padding:'10px 14px', background:'#F1F3F5', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, cursor:'pointer'}}>최대 사용</button>
          </div>
          <div style={{fontSize:10, color:'#888', marginTop:8}}>💡 포인트는 30일 유효, 결제 시 최대 30%만 사용 가능</div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6}}><span>상품 금액</span><span>{price.toLocaleString()}원</span></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6}}><span>포인트 할인</span><span style={{color:'#E91E63'}}>-{usePoints.toLocaleString()}원</span></div>
          <div style={{height:1, background:'#EEF2F7', margin:'8px 0'}}></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:800}}><span>결제 금액</span><span style={{color:'#1a1a2e'}}>{(price - usePoints).toLocaleString()}원</span></div>
        </div>

        <button onClick={handlePay} style={{width:'100%', padding:14, background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:12, fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 4px 12px rgba(255,214,0,0.3)'}}>
          {(price - usePoints).toLocaleString()}원 결제하기
        </button>

        <div style={{textAlign:'center', marginTop:12, fontSize:10, color:'#888'}}>결제 시 이용약관에 동의한 것으로 간주됩니다<br/>문의: parkhy5454@gmail.com</div>
      </div>
    </div>
  )
}
