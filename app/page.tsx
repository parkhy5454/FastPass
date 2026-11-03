
'use client'
import { useEffect, useState } from 'react'

export default function HomePage(){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      if(d.user){
        // 로그인 되어 있으면 학습 페이지로
        // location.href='/learn'
      }
    }).catch(()=> setLoading(false))
  },[])

  if(loading) return <main style={{padding:'20px', display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#F8F9FB'}}><div>로딩중...</div></main>

  if(user){
    return (
      <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
        <div style={{background:'white', borderRadius:'20px', padding:'24px', textAlign:'center', marginTop:'40px'}}>
          <div style={{fontSize:'24px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
            <span>⚡</span> 자격증 패스트패스
          </div>
          <div style={{fontSize:'13px', color:'#6B7280', marginTop:'8px'}}>기능사부터 기술사까지, 6단계 올인원 - {user.name}님 환영!</div>
          <div style={{marginTop:'20px', display:'grid', gap:'12px'}}>
            <button onClick={()=>location.href='/learn'} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800}}>학습하기</button>
            <button onClick={()=>location.href='/my'} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800}}>MY 페이지</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px'}}>
      <div style={{background:'white', borderRadius:'20px', padding:'32px 24px', width:'100%', maxWidth:'360px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)'}}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <div style={{fontSize:'24px', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
            <span>⚡</span> 자격증 패스트패스
          </div>
          <div style={{fontSize:'13px', color:'#6B7280', marginTop:'8px'}}>기능사부터 기술사까지, 6단계 올인원</div>
        </div>
        
        <div style={{display:'grid', gap:'12px'}}>
          <button onClick={()=>location.href='/login'} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800, fontSize:'15px'}}>로그인</button>
          <button onClick={()=>location.href='/signup'} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800, fontSize:'15px'}}>회원가입</button>
        </div>

        <div style={{marginTop:'20px', fontSize:'11px', color:'#9CA3AF', textAlign:'center', lineHeight:'1.5'}}>
          전기, 토목(24개), 정보통신(20개), 기계(20개), 건축, 소방 등 모든 자격증 가능<br/>
          관심사 선택시 해당 분야만 학습에 표시
        </div>
      </div>
    </main>
  )
}
