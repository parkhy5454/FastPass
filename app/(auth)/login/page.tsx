
'use client'
import { useState } from 'react'
import PasswordInput from '@/components/PasswordInput'
export default function LoginPage(){
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  async function onSubmit(e:any){
    e.preventDefault()
    const res = await fetch('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId, password})})
    const data = await res.json()
    if(res.ok){ location.href='/' } else setMsg(data.error||'실패')
  }
  return (
    <main style={{padding:'20px'}}>
      <div style={{maxWidth:'380px', margin:'20px auto 0', background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
        <h1 style={{fontSize:'24px', fontWeight:800}}>로그인</h1>
        <form onSubmit={onSubmit} style={{marginTop:'20px', display:'grid', gap:'12px'}}>
          <input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="아이디" style={{padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB'}} />
          <PasswordInput value={password} onChange={(e:any)=>setPassword(e.target.value)} placeholder="비밀번호" name="password" />
          <button type="submit" style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800}}>로그인</button>
          <div style={{fontSize:'13px', color:'#EF4444'}}>{msg}</div>
        </form>
      </div>
    </main>
  )
}
