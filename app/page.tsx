
'use client'
import { useEffect, useState } from 'react'
export default function Home(){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>{ setUser(d.user); setLoading(false) }).catch(()=>setLoading(false)) },[])
  if(loading) return <div style={{padding:'40px', textAlign:'center'}}>로딩...</div>
  if(user){
    return (
      <main style={{padding:'20px'}}>
        <div style={{background:'white', borderRadius:'24px', padding:'28px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)'}}>
          <h1 style={{fontSize:'22px', fontWeight:900, margin:0}}>안녕하세요, {user.name}님! 👋</h1>
          <p style={{color:'#6B7280', fontSize:'14px', marginTop:'6px'}}>{user.loginId} | {user.interests?.join(', ')}</p>
          <div style={{marginTop:'20px', display:'grid', gap:'12px'}}>
            <a href="/study" style={{background:'#FFF7CC', borderRadius:'16px', padding:'18px', textDecoration:'none', color:'#111827', border:'1px solid #FFE066'}}><div style={{fontWeight:700}}>📚 학습 시작</div><div style={{fontSize:'13px', color:'#92400E', marginTop:'4px'}}>기출 10년치 + 예상 300제</div></a>
            <div style={{background:'#F3F4F6', borderRadius:'16px', padding:'18px', display:'flex', justifyContent:'space-between'}}><span>오늘 푼 문제</span><span style={{fontWeight:800}}>12문제</span></div>
            <div style={{background:'#F3F4F6', borderRadius:'16px', padding:'18px', display:'flex', justifyContent:'space-between'}}><span>오답노트 복습</span><span style={{fontWeight:800, color:'#EF4444'}}>5개</span></div>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main style={{padding:'20px'}}>
      <div style={{background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', marginTop:'20px'}}>
        <h1 style={{fontSize:'28px', fontWeight:900, margin:0}}>⚡ 전기 패스트패스</h1>
        <p style={{color:'#6B7280', marginTop:'8px'}}>기능사부터 기술사까지, 6단계 올인원</p>
        <div style={{marginTop:'28px', display:'grid', gap:'12px'}}>
          <a href="/login" style={{background:'#FFD60A', color:'black', borderRadius:'16px', padding:'18px', textAlign:'center', fontWeight:800, textDecoration:'none', display:'block'}}>로그인</a>
          <a href="/signup" style={{background:'#111827', borderRadius:'16px', padding:'18px', textAlign:'center', color:'white', textDecoration:'none', display:'block', fontWeight:700}}>회원가입</a>
        </div>
      </div>
    </main>
  )
}
