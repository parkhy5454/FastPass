
'use client'
import { useState, useEffect } from 'react'
import { PLANS, PRODUCTS, calculatePointsUsage } from '@/lib/subscription'

export default function PaymentPage(){
  const [plan, setPlan] = useState('YEARLY')
  const [product, setProduct] = useState('')
  const [points, setPoints] = useState(0)
  const [usePoints, setUsePoints] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [timer, setTimer] = useState({h:23,m:59,s:59})

  useEffect(()=>{
    const url = new URL(window.location.href)
    const p = url.searchParams.get('plan')
    const prod = url.searchParams.get('product')
    if(p) setPlan(p)
    if(prod) setProduct(prod)
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ if(d.user){ setUser(d.user); setPoints(d.user.points||0) } }).catch(()=>{})
    fetch('/api/referral/stats').then(r=>r.json()).then(d=> setPoints(d.points||d.totalPoints||0)).catch(()=>{})
    const interval=setInterval(()=>{
      const end=new Date(); end.setHours(23,59,59,999)
      const diff=end.getTime()-Date.now()
      if(diff>0) setTimer({h:Math.floor(diff/(1000*60*60)), m:Math.floor((diff%(1000*60*60))/(1000*60)), s:Math.floor((diff%(1000*60))/1000)})
    },1000)
    return ()=> clearInterval(interval)
  },[])

  const selectedPlan = PLANS[plan as keyof typeof PLANS] || PLANS.YEARLY
  const selectedProduct = product ? PRODUCTS[product as keyof typeof PRODUCTS] : null
  const price = selectedProduct ? (selectedProduct as any).price : (selectedPlan as any).price || 59900
  const originalPrice = (selectedPlan as any).originalPrice || price
  const {usable, payAmount} = calculatePointsUsage(price, points)

  async function handlePay(){
    const finalPoints = Math.min(usePoints, usable)
    const finalPay = price - finalPoints
    try{
      const idempotencyKey = `${user?.id||'anon'}-${plan||product}-${Date.now()}`
      const res = await fetch('/api/payments/verify', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({amount: finalPay, productId: plan||product, idempotencyKey, paymentMethod:'card', pointsUsed: finalPoints, totalPrice: price})
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)
      alert(`${selectedProduct ? selectedProduct.name : selectedPlan.name} 결제 완료! ${finalPay.toLocaleString()}원 결제 (포인트 ${finalPoints}P 사용)`)
      window.location.href = '/my'
    }catch(e:any){ alert('결제 실패: '+e.message) }
  }

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{background:'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)', color:'white', padding:'10px 14px', borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, fontWeight:700, fontSize:12}}>
          <span>🔥 첫 결제 50% 할인!</span>
          <span style={{background:'white', color:'#CC0000', padding:'4px 10px', borderRadius:8, fontWeight:800}}>{String(timer.h).padStart(2,'0')}:{String(timer.m).padStart(2,'0')}:{String(timer.s).padStart(2,'0')}</span>
        </div>

        <div style={{fontSize:20, fontWeight:800, marginBottom:6, color:'#1a1a2e'}}>결제하기</div>
        <div style={{fontSize:11, color:'#888', marginBottom:16}}>1,234명이 구독 중! ⭐ 4.8점 • 합격률 300%↑</div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:14, fontWeight:700, marginBottom:12}}>구독 플랜</div>
          {Object.values(PLANS).filter((p:any)=> p.id!=='FREE').map((p:any)=>(
            <button key={p.id} onClick={()=>{ setPlan(p.id); setProduct('') }} style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:14, background: plan===p.id && !product ? '#FFF9DB' : 'white', border: plan===p.id && !product ? '2.5px solid #FFD600' : '1px solid #E9ECEF', borderRadius:12, marginBottom:8, cursor:'pointer', textAlign:'left', boxShadow: plan===p.id && !product ? '0 3px 12px rgba(255,214,0,0.2)' : 'none'}}>
              <div>
                <div style={{fontSize:14, fontWeight:700}}>{p.name} {p.best && <span style={{background:'#FF4444', color:'white', padding:'2px 6px', borderRadius:8, fontSize:8}}>BEST</span>} {p.popular && <span style={{background:'#FFD600', padding:'2px 6px', borderRadius:8, fontSize:8}}>인기</span>} {p.left && <span style={{background:'#FFE0E0', color:'#C53030', padding:'2px 6px', borderRadius:8, fontSize:8}}>{p.left}명 남음</span>}</div>
                <div style={{fontSize:11, color:'#888'}}>{p.period} {p.discount ? `${p.discount}% 할인` : ''} {p.desc && `• ${p.desc}`}</div>
              </div>
              <div style={{textAlign:'right'}}><div style={{fontSize:16, fontWeight:800}}>{p.price.toLocaleString()}원</div>{p.originalPrice && <div style={{fontSize:10, color:'#888', textDecoration:'line-through'}}>{p.originalPrice.toLocaleString()}원</div>}</div>
            </button>
          ))}
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:14, fontWeight:700, marginBottom:12}}>추가 상품 (고마진!)</div>
          {Object.values(PRODUCTS).map((p:any)=>(
            <button key={p.id} onClick={()=>{ setProduct(p.id); setPlan('') }} style={{width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:12, background: product===p.id ? '#F0F4FF' : 'white', border: product===p.id ? '2px solid #4285F4' : '1px solid #E9ECEF', borderRadius:12, marginBottom:8, cursor:'pointer', textAlign:'left'}}>
              <div><div style={{fontSize:13, fontWeight:700}}>{p.name}</div><div style={{fontSize:10, color:'#888'}}>{p.desc} • 마진 {p.margin}%</div></div>
              <div style={{fontSize:14, fontWeight:800}}>{p.price.toLocaleString()}원</div>
            </button>
          ))}
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:14, fontWeight:700, marginBottom:12}}>포인트 사용 (30일 유효, 최대 30%)</div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6}}><span>보유 포인트</span><span style={{fontWeight:700, color:'#E91E63'}}>{points.toLocaleString()}P</span></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8}}><span>최대 사용 가능 (30%)</span><span>{usable.toLocaleString()}P</span></div>
          <input type='range' min={0} max={usable} value={usePoints} onChange={e=>setUsePoints(Number(e.target.value))} style={{width:'100%', margin:'10px 0'}} />
          <div style={{display:'flex', gap:8}}>
            <input type='number' value={usePoints} onChange={e=>setUsePoints(Math.min(Number(e.target.value), usable))} style={{flex:1, padding:10, border:'1px solid #E9ECEF', borderRadius:8, fontSize:12}} placeholder='사용 포인트' />
            <button onClick={()=>setUsePoints(usable)} style={{padding:'10px 14px', background:'#F1F3F5', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600}}>최대 사용</button>
          </div>
          <div style={{fontSize:10, color:'#888', marginTop:8}}>💡 포인트는 30일 유효, 결제 시 최대 30%만 사용 가능 (70%는 현금 결제 유도!)</div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6}}><span>상품 금액</span><span>{price.toLocaleString()}원 {originalPrice!==price && <span style={{textDecoration:'line-through', color:'#888', fontSize:10}}> {originalPrice.toLocaleString()}원</span>}</span></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6}}><span>포인트 할인</span><span style={{color:'#E91E63'}}>-{usePoints.toLocaleString()}원</span></div>
          <div style={{height:1, background:'#EEF2F7', margin:'8px 0'}}></div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:800}}><span>결제 금액</span><span style={{color:'#1a1a2e'}}>{(price - usePoints).toLocaleString()}원</span></div>
          <div style={{fontSize:10, color:'#888', marginTop:4, textAlign:'right'}}>현금 {Math.round(((price-usePoints)/price)*100)}% + 포인트 {Math.round((usePoints/price)*100)}%</div>
        </div>

        <button onClick={handlePay} style={{width:'100%', padding:16, background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 6px 20px rgba(255,214,0,0.4)'}}>
          {(price - usePoints).toLocaleString()}원 결제하기 →
        </button>

        <div style={{background:'#F0F4FF', borderRadius:10, padding:10, marginTop:12, fontSize:10, color:'#3367D6', textAlign:'center'}}>
          ✓ 결제 후 즉시 이용 가능 • 1,234명 구독 중 • 문의: parkhy5454@gmail.com<br/>
          합격 보장반은 불합격 시 1년 무료 연장!
        </div>
      </div>
    </div>
  )
}
