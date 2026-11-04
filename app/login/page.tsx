
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const [form,setForm]=useState({loginId:'', password:''})
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const router=useRouter()

  async function handleLogin(e:any){
    e.preventDefault()
    if(!form.loginId.trim() || !form.password.trim()){
      setError('아이디와 비밀번호를 입력하세요')
      return
    }
    setLoading(true)
    setError('')
    try{
      const res=await fetch('/api/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({loginId: form.loginId.trim(), password: form.password.trim()})
      })
      let data:any
      const text=await res.text()
      try{ data=JSON.parse(text) }catch{ data={error:text} }
      if(!res.ok) throw new Error(data.error||'로그인 실패')
      try{
        if(data.token) localStorage.setItem('token', data.token)
        if(data.user) localStorage.setItem('user', JSON.stringify(data.user))
      }catch{}
      window.location.href = '/'
      return
    }catch(err:any){
      let msg = String(err?.message||'로그인 실패')
      if(msg.includes('[object Object]')) msg='아이디 또는 비밀번호를 확인하세요'
      setError(msg)
    }finally{ setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{width:'100%', maxWidth:380, background:'white', borderRadius:20, padding:28, border:'1px solid #EEF2F7', boxShadow:'0 8px 32px rgba(0,0,0,0.06)'}}>
        <div style={{textAlign:'center', marginBottom:20}}>
          <div style={{fontSize:28, marginBottom:8}}>⚡</div>
          <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e'}}>자격증 패스트패스</div>
          <div style={{fontSize:12, color:'#888', marginTop:4}}>로그인</div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:12}}>
            <input value={form.loginId} onChange={e=>setForm({...form, loginId:e.target.value})} placeholder="아이디 또는 이메일" style={{width:'100%', padding:'13px', border:'1px solid #E9ECEF', borderRadius:12, fontSize:13, boxSizing:'border-box', background:'white'}} autoComplete="username" />
          </div>
          <div style={{marginBottom:16}}>
            <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="비밀번호" style={{width:'100%', padding:'13px', border:'1px solid #E9ECEF', borderRadius:12, fontSize:13, boxSizing:'border-box', background:'white'}} autoComplete="current-password" />
          </div>
          {error && <div style={{background:'#FFF1F1', color:'#E5484D', border:'1px solid #FFD1D1', borderRadius:10, padding:'10px 12px', fontSize:12, marginBottom:12}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width:'100%', padding:'14px', background: loading ? '#ccc' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:12, fontWeight:800, fontSize:14, cursor:'pointer', color:'#1a1a2e'}}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <button onClick={()=> router.push('/signup')} style={{width:'100%', marginTop:12, padding:'14px', background:'#1a1a2e', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer'}}>회원가입</button>
        <div style={{textAlign:'center', marginTop:12}}><a href="/" style={{fontSize:11, color:'#888', textDecoration:'none'}}>홈으로 돌아가기</a></div>
        <div style={{marginTop:16, padding:10, background:'#F8F9FA', borderRadius:10, fontSize:10, color:'#888', lineHeight:'1.5'}}>💡 테스트: demo / 1234<br/>관리자: parkhy5454@gmail.com / admin</div>
      </div>
    </div>
  )
}
