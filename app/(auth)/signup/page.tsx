
'use client'
import { useState } from 'react'
import PasswordInput from '@/components/PasswordInput'
export default function SignupPage(){
  const [form, setForm] = useState({loginId:'', password:'', name:'', phone:'', interests:''})
  const [msg, setMsg] = useState('')
  function update(k:string,v:string){ setForm(s=>({...s, [k]:v})) }
  async function onSubmit(e:any){
    e.preventDefault()
    const res = await fetch('/api/auth/signup', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, interests: form.interests.split(',')})})
    const data = await res.json()
    if(res.ok){ setMsg('회원가입 성공!'); location.href='/login' } else setMsg(data.error||'실패')
  }
  return (
    <main style={{minHeight:'100vh', background:'#0F0F0F', color:'white', padding:'24px'}}>
      <div style={{maxWidth:'360px', margin:'0 auto'}}>
        <h1 style={{fontSize:'28px', fontWeight:800}}>회원가입</h1>
        <form onSubmit={onSubmit} style={{marginTop:'24px', display:'grid', gap:'12px'}}>
          <input value={form.loginId} onChange={e=>update('loginId', e.target.value)} placeholder="아이디" style={{padding:'12px', borderRadius:'12px', border:'1px solid #333', background:'#27272a', color:'white'}} />
          <PasswordInput value={form.password} onChange={(e:any)=>update('password', e.target.value)} placeholder="비밀번호 (눈 아이콘으로 보기)" name="password" />
          <input value={form.name} onChange={e=>update('name', e.target.value)} placeholder="이름" style={{padding:'12px', borderRadius:'12px', border:'1px solid #333', background:'#27272a', color:'white'}} />
          <input value={form.phone} onChange={e=>update('phone', e.target.value)} placeholder="핸드폰 번호" style={{padding:'12px', borderRadius:'12px', border:'1px solid #333', background:'#27272a', color:'white'}} />
          <input value={form.interests} onChange={e=>update('interests', e.target.value)} placeholder="관심 자격증 (예: 전기기사)" style={{padding:'12px', borderRadius:'12px', border:'1px solid #333', background:'#27272a', color:'white'}} />
          <button type="submit" style={{background:'#FFD60A', color:'black', padding:'14px', borderRadius:'12px', fontWeight:800, border:'none'}}>가입하기</button>
          <div style={{color:'#a1a1aa', fontSize:'13px'}}>{msg}</div>
        </form>
      </div>
    </main>
  )
}
