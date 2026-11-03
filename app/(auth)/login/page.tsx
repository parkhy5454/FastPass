
'use client'
import { useState } from 'react'
export default function LoginPage(){
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function handleLogin(e:any){
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const res = await fetch('/api/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({loginId, password})
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.error || '로그인 실패')
        setLoading(false)
        return
      }
      location.href = '/'
    }catch(err){
      setError('로그인 중 오류가 발생했습니다')
      setLoading(false)
    }
  }
  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px'}}>
      <div style={{background:'white', borderRadius:'20px', padding:'32px 24px', width:'100%', maxWidth:'360px'}}>
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <div style={{fontSize:'22px', fontWeight:800}}>⚡ 자격증 패스트패스</div>
          <div style={{fontSize:'13px', color:'#6B7280', marginTop:'6px'}}>로그인</div>
        </div>
        <form onSubmit={handleLogin} style={{display:'grid', gap:'12px'}}>
          <input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="아이디" style={{padding:'14px', borderRadius:'10px', border:'1px solid #E5E7EB'}} required />
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="비밀번호" style={{padding:'14px', borderRadius:'10px', border:'1px solid #E5E7EB'}} required />
          {error && <div style={{color:'red', fontSize:'12px', textAlign:'center'}}>{error}</div>}
          <button type="submit" disabled={loading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800}}>
            {loading ? '로그인중...' : '로그인'}
          </button>
          <button type="button" onClick={()=>location.href='/signup'} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800}}>회원가입</button>
          <button type="button" onClick={()=>location.href='/'} style={{background:'transparent', border:'none', color:'#6B7280', fontSize:'12px'}}>홈으로 돌아가기</button>
        </form>
      </div>
    </main>
  )
}
