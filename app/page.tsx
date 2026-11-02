
'use client'
import { useEffect, useState } from 'react'
export default function Home(){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ setUser(d.user); setLoading(false) }).catch(()=>setLoading(false))
  },[])
  async function logout(){
    await fetch('/api/auth/logout', {method:'POST'})
    location.reload()
  }
  if(loading) return <main style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', alignItems:'center', justifyContent:'center'}}>로딩...</main>
  // 로그인 된 경우
  if(user){
    return (
      <main style={{minHeight:'100vh', background:'#F8F9FB', color:'#111827', padding:'24px'}}>
        <div style={{maxWidth:'420px', margin:'0 auto'}}>
          <div style={{background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', marginTop:'40px'}}>
            <h1 style={{fontSize:'24px', fontWeight:900, margin:0}}>안녕하세요, {user.name}님! 👋</h1>
            <p style={{color:'#6B7280', marginTop:'8px', fontSize:'14px'}}>아이디: {user.loginId} | {user.interests?.join(', ')}</p>
            <div style={{marginTop:'28px', display:'grid', gap:'12px'}}>
              <div style={{background:'#F8F9FB', borderRadius:'16px', padding:'20px', border:'1px solid #E5E7EB'}}>
                <div style={{fontWeight:700}}>📚 내 학습</div>
                <div style={{fontSize:'13px', color:'#6B7280', marginTop:'4px'}}>기출문제, 예상문제, 오답노트</div>
              </div>
              <div style={{background:'#FFF7CC', borderRadius:'16px', padding:'20px', border:'1px solid #FFE066'}}>
                <div style={{fontWeight:700}}>🎯 예상 300제</div>
                <div style={{fontSize:'13px', color:'#92400E', marginTop:'4px'}}>이번 회차 적중률 87% 예상</div>
              </div>
              <div style={{background:'#F3F4F6', borderRadius:'16px', padding:'20px', border:'1px solid #E5E7EB'}}>
                <div style={{fontWeight:700}}>💼 취업 정보</div>
                <div style={{fontSize:'13px', color:'#6B7280', marginTop:'4px'}}>구인/구직 매칭</div>
              </div>
              <button onClick={logout} style={{marginTop:'8px', background:'#111827', color:'white', borderRadius:'12px', padding:'14px', border:'none', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
              {user.role==='ADMIN' && <a href="/admin" style={{background:'#FFD60A', color:'black', borderRadius:'12px', padding:'14px', textAlign:'center', textDecoration:'none', fontWeight:700, display:'block'}}>관리자 대시보드</a>}
            </div>
          </div>
        </div>
      </main>
    )
  }
  // 로그인 안 된 경우
  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', color:'#111827', padding:'24px'}}>
      <div style={{maxWidth:'420px', margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', marginTop:'40px'}}>
          <h1 style={{fontSize:'32px', fontWeight:900, margin:0}}>⚡ 전기 패스트패스</h1>
          <p style={{color:'#6B7280', marginTop:'8px'}}>기능사부터 기술사까지, 6단계 올인원</p>
          <div style={{marginTop:'32px', display:'grid', gap:'12px'}}>
            <a href="/login" style={{background:'#FFD60A', color:'black', borderRadius:'16px', padding:'18px', textAlign:'center', fontWeight:800, textDecoration:'none', display:'block'}}>로그인</a>
            <a href="/signup" style={{background:'#111827', borderRadius:'16px', padding:'18px', textAlign:'center', color:'white', textDecoration:'none', display:'block', fontWeight:700}}>회원가입</a>
            <a href="/admin" style={{background:'#F3F4F6', borderRadius:'16px', padding:'18px', textAlign:'center', color:'#374151', textDecoration:'none', display:'block', fontWeight:600, border:'1px solid #E5E7EB'}}>관리자</a>
          </div>
        </div>
      </div>
    </main>
  )
}
