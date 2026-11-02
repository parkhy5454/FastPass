
'use client'
import { useState } from 'react'
export default function SignupPage(){
  const [form, setForm] = useState({loginId:'', password:'', name:'', phone:'', interests:''})
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  function update(k:string,v:string){ setForm(s=>({...s, [k]:v})) }
  async function onSubmit(e:any){
    e.preventDefault()
    const res = await fetch('/api/auth/signup', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, interests: form.interests.split(',').map((s:string)=>s.trim()).filter(Boolean)})})
    const data = await res.json()
    if(res.ok){ setMsg('회원가입 성공! 로그인으로 이동'); setTimeout(()=>location.href='/login', 800) } else setMsg(data.error||'실패')
  }
  const inputStyle = {padding:'14px 16px', borderRadius:'12px', border:'1px solid #E5E7EB', background:'white', color:'#111827', outline:'none', width:'100%', boxSizing:'border-box' as any}
  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', padding:'24px'}}>
      <div style={{maxWidth:'380px', margin:'20px auto 0', background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
        <h1 style={{fontSize:'26px', fontWeight:800, color:'#111827', margin:0}}>회원가입</h1>
        <p style={{color:'#6B7280', fontSize:'14px', marginTop:'6px'}}>FastPass 시작하기</p>
        <form onSubmit={onSubmit} style={{marginTop:'24px', display:'grid', gap:'12px'}}>
          <input value={form.loginId} onChange={e=>update('loginId', e.target.value)} placeholder="아이디" style={inputStyle} />
          <div style={{position:'relative', display:'flex'}}>
            <input type={show?'text':'password'} value={form.password} onChange={e=>update('password', e.target.value)} placeholder="비밀번호 (눈 아이콘으로 보기)" style={{...inputStyle, paddingRight:'44px'}} />
            <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'18px'}}>{show?'🙈':'👁️'}</button>
          </div>
          <input value={form.name} onChange={e=>update('name', e.target.value)} placeholder="이름" style={inputStyle} />
          <input value={form.phone} onChange={e=>update('phone', e.target.value)} placeholder="핸드폰 번호" style={inputStyle} />
          <input value={form.interests} onChange={e=>update('interests', e.target.value)} placeholder="관심 자격증 (예: 전기기사)" style={inputStyle} />
          <button type="submit" style={{background:'#FFD60A', color:'black', padding:'14px', borderRadius:'12px', fontWeight:800, border:'none', cursor:'pointer', marginTop:'8px'}}>가입하기</button>
          <div style={{fontSize:'13px', minHeight:'18px', color: msg.includes('성공') ? '#10B981' : '#EF4444'}}>{msg}</div>
        </form>
      </div>
    </main>
  )
}
