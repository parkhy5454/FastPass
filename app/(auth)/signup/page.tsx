
'use client'
import { useState } from 'react'
import PasswordInput from '@/components/PasswordInput'
export default function SignupPage(){
  const [form, setForm] = useState({loginId:'', password:'', name:'', phone:'', interests:''})
  const [msg, setMsg] = useState('')
  function update(k:string,v:string){ setForm(s=>({...s, [k]:v})) }
  async function onSubmit(e:any){
    e.preventDefault()
    const res = await fetch('/api/auth/signup', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, interests: form.interests.split(',').map((s:string)=>s.trim()).filter(Boolean)})})
    const data = await res.json()
    if(res.ok){ setMsg('성공!'); location.href='/login' } else setMsg(data.error||'실패')
  }
  return (
    <main style={{padding:'20px'}}>
      <div style={{maxWidth:'380px', margin:'20px auto 0', background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
        <h1 style={{fontSize:'24px', fontWeight:800}}>회원가입</h1>
        <form onSubmit={onSubmit} style={{marginTop:'20px', display:'grid', gap:'12px'}}>
          <input value={form.loginId} onChange={e=>update('loginId', e.target.value)} placeholder="아이디" style={{padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB'}} />
          <PasswordInput value={form.password} onChange={(e:any)=>update('password', e.target.value)} placeholder="비밀번호" name="password" />
          <input value={form.name} onChange={e=>update('name', e.target.value)} placeholder="이름" style={{padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB'}} />
          <input value={form.phone} onChange={e=>update('phone', e.target.value)} placeholder="핸드폰" style={{padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB'}} />
          <input value={form.interests} onChange={e=>update('interests', e.target.value)} placeholder="관심자격증" style={{padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB'}} />
          <button type="submit" style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800}}>가입하기</button>
          <div style={{fontSize:'13px', color:'#EF4444'}}>{msg}</div>
        </form>
      </div>
    </main>
  )
}
