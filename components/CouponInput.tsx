
'use client'
import { useState } from 'react'
export default function CouponInput({onApply}:{onApply:(discount:number, code:string)=>void}){
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')
  const validate = async () => {
    setStatus('loading')
    try{
      const res = await fetch('/api/coupon/validate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code})})
      const data = await res.json()
      if(data.valid){ setStatus('success'); setMessage(`${data.discount}% 할인 적용!`); onApply(data.discount, code) }
      else{ setStatus('error'); setMessage(data.message||'유효하지 않은 쿠폰') }
    }catch{ setStatus('error'); setMessage('쿠폰 확인 실패') }
  }
  return (
    <div style={{background:'white', borderRadius:'16px', padding:'16px', border: status==='success' ? '2px solid #22C55E' : '1px solid #E5E7EB'}}>
      <div style={{fontWeight:700, fontSize:'13px'}}>쿠폰 코드</div>
      <div style={{display:'flex', gap:'8px', marginTop:'10px'}}>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="쿠폰 입력 (예: WELCOME10)" style={{flex:1, padding:'12px', borderRadius:'10px', border: status==='error' ? '1.5px solid #DC2626' : status==='success' ? '1.5px solid #22C55E' : '1.5px solid #E5E7EB', fontSize:'13px', fontWeight:700}} />
        <button onClick={validate} disabled={status==='loading'} style={{background: status==='success' ? '#22C55E' : '#111827', color:'white', border:'none', borderRadius:'10px', padding:'12px 18px', fontWeight:700, fontSize:'13px'}}>{status==='loading' ? '확인중' : '적용'}</button>
      </div>
      {message && <div style={{marginTop:'8px', fontSize:'12px', color: status==='success' ? '#22C55E' : '#DC2626', fontWeight:600}}>{message}</div>}
    </div>
  )
}
