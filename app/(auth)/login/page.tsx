
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage(){
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(){
    setError('')
    if(!loginId.trim()){ setError('아이디를 입력하세요'); return }
    if(!password){ setError('비밀번호를 입력하세요'); return }

    setLoading(true)
    try{
      const res = await fetch('/api/auth/login', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({loginId: loginId.trim(), password})
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.error||'로그인 실패')
        setLoading(false)
        return
      }
      // Success
      window.location.href = '/'
    }catch(e:any){
      setError('로그인 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f5', padding:20}}>
      <div style={{background:'white', borderRadius:20, padding:32, width:'100%', maxWidth:380, boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
        <div style={{textAlign:'center', marginBottom:24}}>
          <div style={{fontSize:22, fontWeight:800}}>⚡ 자격증 패스트패스</div>
          <div style={{fontSize:14, color:'#888', marginTop:4}}>로그인</div>
        </div>

        <input 
          value={loginId} 
          onChange={e=>setLoginId(e.target.value)} 
          placeholder="아이디 또는 이메일" 
          style={{width:'100%', padding:'14px 16px', borderRadius:12, border:'1px solid #e5e5e5', fontSize:15, marginBottom:12, boxSizing:'border-box'}}
          onKeyDown={e=> e.key==='Enter' && handleLogin()}
        />
        <div style={{position:'relative', marginBottom:12}}>
          <input 
            type={showPw?'text':'password'} 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            placeholder="비밀번호" 
            style={{width:'100%', padding:'14px 40px 14px 16px', borderRadius:12, border:'1px solid #e5e5e5', fontSize:15, boxSizing:'border-box'}}
            onKeyDown={e=> e.key==='Enter' && handleLogin()}
          />
          <button onClick={()=>setShowPw(!showPw)} style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18}}>
            {showPw?'🙈':'👁️'}
          </button>
        </div>

        {error && <div style={{color:'#e53e3e', fontSize:13, textAlign:'center', marginBottom:12}}>{error}</div>}

        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{width:'100%', padding:14, background: loading ? '#ccc' : '#FFD600', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor: loading?'not-allowed':'pointer', marginBottom:10}}
        >
          {loading?'로그인 중...':'로그인'}
        </button>
        <button onClick={()=>router.push('/signup')} style={{width:'100%', padding:14, background:'#1a1a2e', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:15, cursor:'pointer'}}>
          회원가입
        </button>
        <div style={{textAlign:'center', marginTop:14}}>
          <a href="/" style={{fontSize:13, color:'#888', textDecoration:'none'}}>홈으로 돌아가기</a>
        </div>
        <div style={{marginTop:16, padding:12, background:'#f8f9fa', borderRadius:8, fontSize:12, color:'#666'}}>
          <div>💡 테스트 계정: demo / 1234</div>
          <div>관리자: parkhy5454@gmail.com</div>
        </div>
      </div>
    </div>
  )
}
