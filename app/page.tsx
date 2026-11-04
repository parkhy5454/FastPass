
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage(){
  const [user,setUser]=useState<any>(null)
  const [stats,setStats]=useState({solved:0, correct:0, streak:0})
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(()=> router.push('/login'))
    fetch('/api/stats').then(r=>r.json()).then(d=> setStats(d)).catch(()=>{})
    fetch('/api/points/attendance', {method:'POST', credentials:'include'}).catch(()=>{})
  },[])

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div>
            <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e'}}>⚡ 자격증 패스트패스</div>
            <div style={{fontSize:11, color:'#888', marginTop:2}}>기능사부터 기술사까지, 6단계 올인원 - {user.name||user.loginId}님 환영!</div>
          </div>
          <div style={{width:36, height:36, borderRadius:18, background:'#F1F3F5', display:'flex', alignItems:'center', justifyContent:'center'}}>👤</div>
        </div>

        <div style={{background:'linear-gradient(135deg, #FFF9DB 0%, #FFFEF5 100%)', border:'1px solid #FFE066', borderRadius:16, padding:14, marginBottom:14}}>
          <div style={{fontSize:11, fontWeight:700, color:'#8B6914', marginBottom:8}}>🔥 오늘의 학습 목표</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
            <div style={{background:'white', borderRadius:12, padding:10, textAlign:'center', border:'1px solid #FFF0A0'}}><div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>{stats.solved}</div><div style={{fontSize:10, color:'#888'}}>푼 문제</div></div>
            <div style={{background:'white', borderRadius:12, padding:10, textAlign:'center', border:'1px solid #FFF0A0'}}><div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>{stats.correct}%</div><div style={{fontSize:10, color:'#888'}}>정답률</div></div>
            <div style={{background:'white', borderRadius:12, padding:10, textAlign:'center', border:'1px solid #FFF0A0'}}><div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>{stats.streak}일</div><div style={{fontSize:10, color:'#888'}}>연속 학습</div></div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16}}>
          <button onClick={()=>router.push('/learn')} style={{padding:'20px 16px', background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:16, textAlign:'left', cursor:'pointer', boxShadow:'0 4px 12px rgba(255,214,0,0.3)'}}>
            <div style={{fontSize:20, marginBottom:6}}>📚</div>
            <div style={{fontSize:14, fontWeight:800, color:'#1a1a2e'}}>학습하기</div>
            <div style={{fontSize:10, color:'#6B5900', marginTop:2}}>내 관심 자격증 학습</div>
          </button>
          <button onClick={()=>router.push('/my')} style={{padding:'20px 16px', background:'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)', border:'none', borderRadius:16, textAlign:'left', cursor:'pointer', boxShadow:'0 4px 12px rgba(66,133,244,0.3)'}}>
            <div style={{fontSize:20, marginBottom:6}}>⚙️</div>
            <div style={{fontSize:14, fontWeight:800, color:'white'}}>MY 페이지</div>
            <div style={{fontSize:10, color:'rgba(255,255,255,0.8)', marginTop:2}}>내 정보, PDF 관리</div>
          </button>
        </div>

        <div style={{marginBottom:12}}>
          <div style={{fontSize:13, fontWeight:800, color:'#1a1a2e', marginBottom:8}}>⭐ 내 관심 자격증</div>
          <button onClick={()=>router.push('/learn')} style={{padding:'8px 14px', background:'white', border:'1.5px solid #BFDBFE', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', color:'#4285F4'}}>{user.interest||'건축전기설비기사'}</button>
        </div>

        <div style={{background:'white', borderRadius:16, padding:20, border:'1px solid #EEF2F7', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:24, marginBottom:8}}>📝</div>
          <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:4}}>최근 학습 기록이 없어요</div>
          <div style={{fontSize:11, color:'#888', marginBottom:12}}>학습을 시작하면 여기에 기록이 표시됩니다</div>
          <button onClick={()=>router.push('/learn')} style={{padding:'10px 18px', background:'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)', color:'white', border:'none', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(66,133,244,0.3)'}}>학습 시작하기</button>
        </div>
      </div>
    </div>
  )
}
