
'use client'
import { useState } from 'react'
export default function LoginPage(){
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [msg, setMsg] = useState('')
  async function onSubmit(e:any){
    e.preventDefault()
    const res = await fetch('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId, password})})
    const data = await res.json()
    if(res.ok){ setMsg('로그인 성공!'); location.href='/' } else setMsg(data.error||'실패')
  }
  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', padding:'24px'}}>
      <div style={{maxWidth:'380px', margin:'40px auto 0', background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
        <h1 style={{fontSize:'26px', fontWeight:800, color:'#111827', margin:0}}>로그인</h1>
        <p style={{color:'#6B7280', fontSize:'14px', marginTop:'6px'}}>전기 패스트패스에 오신 것을 환영합니다</p>
        <form onSubmit={onSubmit} style={{marginTop:'28px', display:'grid', gap:'14px'}}>
          <input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="아이디" style={{padding:'14px 16px', borderRadius:'12px', border:'1px solid #E5E7EB', background:'white', color:'#111827', outline:'none'}} />
          <div style={{position:'relative', display:'flex'}}>
            <input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" style={{width:'100%', padding:'14px 44px 14px 16px', borderRadius:'12px', border:'1px solid #E5E7EB', background:'white', color:'#111827', outline:'none'}} />
            <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'18px'}}>{show?'🙈':'👁️'}</button>
          </div>
          <button type="submit" style={{background:'#FFD60A', color:'black', padding:'14px', borderRadius:'12px', fontWeight:800, border:'none', cursor:'pointer', fontSize:'15px'}}>로그인</button>
          <div style={{color:'#EF4444', fontSize:'13px', minHeight:'18px'}}>{msg}</div>
        </form>
        <a href="/signup" style={{display:'block', marginTop:'20px', textAlign:'center', color:'#6B7280', fontSize:'14px', textDecoration:'none'}}>아직 계정이 없나요? <span style={{color:'#111827', fontWeight:700}}>회원가입</span></a>
      </div>
    </main>
  )
}
