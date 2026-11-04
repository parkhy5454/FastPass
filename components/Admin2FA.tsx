
'use client'
import { useState } from 'react'

export default function Admin2FA({onVerified}: {onVerified:()=>void}){
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  function verify(){
    // Mock TOTP - in real, use speakeasy or authenticator
    // For demo, allow 123456 or any 6-digit
    if(code.length===6 && /^\d{6}$/.test(code)){
      // Check if code is valid (mock: accept 123456 or time-based)
      if(code==='123456' || code===new Date().getMinutes().toString().padStart(2,'0')+'0000'.slice(0,4)){
        onVerified()
        localStorage.setItem('admin2fa', Date.now().toString())
        return
      }
      // For demo, accept any 6-digit as valid
      onVerified()
      localStorage.setItem('admin2fa', Date.now().toString())
    }else{
      setError('6자리 코드를 입력하세요')
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div style={{background:'white', borderRadius:16, padding:24, maxWidth:360, width:'100%', border:'1px solid #EEF2F7'}}>
        <div style={{fontSize:18, fontWeight:800, marginBottom:8}}>🔐 관리자 2차 인증</div>
        <div style={{fontSize:12, color:'#888', marginBottom:16}}>Google OTP 앱의 6자리 코드를 입력하세요<br/>데모: 123456 입력 가능</div>
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder='123456' maxLength={6} style={{width:'100%', padding:14, border:'1px solid #E9ECEF', borderRadius:12, fontSize:18, textAlign:'center', letterSpacing:'8px', fontWeight:700, boxSizing:'border-box', marginBottom:12}} />
        {error && <div style={{color:'#E53E3E', fontSize:12, marginBottom:12, textAlign:'center'}}>{error}</div>}
        <button onClick={verify} style={{width:'100%', padding:14, background:'#1a1a2e', color:'white', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer'}}>인증하기</button>
        <div style={{fontSize:10, color:'#888', marginTop:12, textAlign:'center'}}>관리자는 2FA 필수! Google Authenticator 앱 필요</div>
      </div>
    </div>
  )
}
