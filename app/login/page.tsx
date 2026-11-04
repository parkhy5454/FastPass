
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const [loginId,setLoginId]=useState('')
  const [password,setPassword]=useState('')
  const [showPw,setShowPw]=useState(false)
  const [loading,setLoading]=useState(false)
  const router=useRouter()

  async function handleLogin(){
    if(!loginId.trim()) return alert('아이디를 입력하세요')
    if(!password.trim()) return alert('비밀번호를 입력하세요')
    setLoading(true)
    try{
      console.log('Trying login:', loginId)
      const res=await fetch('/api/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({loginId: loginId.trim(), password})
      })

      let data:any = {}
      try{
        data = await res.json()
      }catch(parseError){
        console.error('JSON parse error', parseError)
        throw new Error('서버 응답 오류 - 다시 시도해주세요')
      }

      console.log('Login response:', res.status, data)

      if(!res.ok){
        const errMsg = typeof data.error === 'string' ? data.error : (data.error?.error || data.message || JSON.stringify(data.error) || '로그인 실패')
        throw new Error(errMsg)
      }

      if(data.user){
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      router.push('/')
    }catch(e:any){
      console.error('Login failed', e)
      const msg = e.message || '로그인 실패'
      // Avoid [object Object]
      if(typeof msg === 'object'){
        alert(JSON.stringify(msg))
      }else{
        alert(msg)
      }
    }finally{ setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{background:'white', borderRadius:20, padding:28, width:'100%', maxWidth:360, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid #EEF2F7'}}>
        <div style={{textAlign:'center', marginBottom:24}}>
          <div style={{fontSize:22, fontWeight:800, color:'#1a1a2e'}}>⚡ 자격증 패스트패스</div>
          <div style={{fontSize:12, color:'#888', marginTop:4}}>로그인</div>
        </div>

        <input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="아이디 또는 이메일" style={{width:'100%', padding:'14px', border:'1px solid #E9ECEF', borderRadius:12, fontSize:13, marginBottom:10, boxSizing:'border-box', background:'white'}} />

        <div style={{position:'relative', marginBottom:16}}>
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호" onKeyDown={e=> e.key==='Enter' && handleLogin()} style={{width:'100%', padding:'14px', border:'1px solid #E9ECEF', borderRadius:12, fontSize:13, boxSizing:'border-box', background:'white'}} />
          <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16}}>{showPw ? '👁️' : '👁️‍🗨️'}</button>
        </div>

        <button onClick={handleLogin} disabled={loading} style={{width:'100%', padding:14, background: loading ? '#ccc' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:12, fontWeight:800, fontSize:14, cursor:'pointer', marginBottom:10}}>{loading ? '로그인 중...' : '로그인'}</button>

        <button onClick={()=> router.push('/signup')} style={{width:'100%', padding:14, background:'#1a1a2e', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:14, cursor:'pointer'}}>회원가입</button>

        <button onClick={()=> router.push('/')} style={{width:'100%', marginTop:12, background:'none', border:'none', color:'#888', fontSize:12, cursor:'pointer'}}>홈으로 돌아가기</button>

        <div style={{marginTop:16, padding:10, background:'#F8F9FA', borderRadius:8, fontSize:11, color:'#666'}}>
          💡 테스트 계정: demo / 1234<br/>관리자: parkhy5454@gmail.com / admin
        </div>
      </div>
    </div>
  )
}
