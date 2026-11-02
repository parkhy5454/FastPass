
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
    if(res.ok){ setMsg('로그인 성공!'); location.href='/' } else setMsg(data.error||'실패')
  }
  return (
    <main style={{minHeight:'100vh', background:'#0F0F0F', color:'white', padding:'24px'}}>
      <div style={{maxWidth:'360px', margin:'0 auto'}}>
        <h1 style={{fontSize:'28px', fontWeight:800}}>로그인</h1>
        <form onSubmit={onSubmit} style={{marginTop:'24px', display:'grid', gap:'12px'}}>
          <input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="아이디" style={{padding:'12px', borderRadius:'12px', border:'1px solid #333', background:'#27272a', color:'white'}} />
          <PasswordInput value={password} onChange={(e:any)=>setPassword(e.target.value)} placeholder="비밀번호" name="password" />
          <button type="submit" style={{background:'#FFD60A', color:'black', padding:'14px', borderRadius:'12px', fontWeight:800, border:'none'}}>로그인</button>
          <div style={{color:'#a1a1aa', fontSize:'13px'}}>{msg}</div>
        </form>
        <a href="/signup" style={{display:'block', marginTop:'16px', textAlign:'center', color:'#a1a1aa'}}>회원가입</a>
      </div>
    </main>
  )
}
