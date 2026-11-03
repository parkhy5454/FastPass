
'use client'
import { useEffect, useState } from 'react'
export default function HomePage(){
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user || null)
      setLoading(false)
    }).catch(()=> setLoading(false))
  },[])
  if(loading){
    return <main style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', alignItems:'center', justifyContent:'center'}}><div>로딩중...</div></main>
  }
  if(!user){
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
            <button onClick={()=>location.href='/login'} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800, fontSize:'15px', cursor:'pointer'}}>로그인</button>
            <button onClick={()=>location.href='/signup'} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800, fontSize:'15px', cursor:'pointer'}}>회원가입</button>
          </div>
        </div>
      </main>
    )
  }
  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:'90px'}}>
      <div style={{background:'white', padding:'20px 20px 24px', borderBottomLeftRadius:'24px', borderBottomRightRadius:'24px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontSize:'22px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px'}}>
              <span>⚡</span> 자격증 패스트패스
            </div>
            <div style={{fontSize:'13px', color:'#6B7280', marginTop:'6px'}}>기능사부터 기술사까지, 6단계 올인원 - {user.name || user.loginId}님 환영!</div>
          </div>
          <button onClick={()=>location.href='/my'} style={{width:'40px', height:'40px', borderRadius:'50%', background:'#F3F4F6', border:'none', fontSize:'18px'}}>👤</button>
        </div>
        <div style={{marginTop:'20px', background:'#FFFBEB', borderRadius:'16px', padding:'16px', border:'1px solid #FDE68A'}}>
          <div style={{fontSize:'13px', fontWeight:800, color:'#92400E'}}>🔥 오늘의 학습 목표</div>
          <div style={{display:'flex', gap:'12px', marginTop:'12px'}}>
            <div style={{flex:1, background:'white', borderRadius:'12px', padding:'12px', textAlign:'center', border:'1px solid #FDE68A'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>0</div>
              <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>푼 문제</div>
            </div>
            <div style={{flex:1, background:'white', borderRadius:'12px', padding:'12px', textAlign:'center', border:'1px solid #FDE68A'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>0%</div>
              <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>정답률</div>
            </div>
            <div style={{flex:1, background:'white', borderRadius:'12px', padding:'12px', textAlign:'center', border:'1px solid #FDE68A'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>0일</div>
              <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>연속 학습</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:'20px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <button onClick={()=>location.href='/learn'} style={{background:'#FFD60A', border:'none', borderRadius:'16px', padding:'20px', textAlign:'left', cursor:'pointer'}}>
            <div style={{fontSize:'28px'}}>📚</div>
            <div style={{fontWeight:800, fontSize:'15px', marginTop:'8px'}}>학습하기</div>
            <div style={{fontSize:'11px', color:'#6B7280', marginTop:'4px'}}>내 관심 자격증 학습</div>
          </button>
          <button onClick={()=>location.href='/my'} style={{background:'#111827', color:'white', border:'none', borderRadius:'16px', padding:'20px', textAlign:'left', cursor:'pointer'}}>
            <div style={{fontSize:'28px'}}>⚙️</div>
            <div style={{fontWeight:800, fontSize:'15px', marginTop:'8px'}}>MY 페이지</div>
            <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'4px'}}>내 정보, PDF 관리</div>
          </button>
        </div>
        <div style={{marginTop:'24px'}}>
          <div style={{fontWeight:800, fontSize:'15px'}}>⭐ 내 관심 자격증</div>
          <div style={{marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'8px'}}>
            {(user.interests || []).length>0 ? (user.interests as string[]).map((q:string)=>(
              <span key={q} style={{background:'white', border:'1.5px solid #BFDBFE', padding:'8px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:700, color:'#2563EB'}}>{q}</span>
            )) : <div style={{fontSize:'13px', color:'#6B7280'}}>관심 자격증이 없습니다.</div>}
          </div>
        </div>
        <div style={{marginTop:'24px', background:'white', borderRadius:'16px', padding:'20px', border:'1px solid #E5E7EB', textAlign:'center'}}>
          <div style={{fontSize:'32px'}}>📝</div>
          <div style={{fontWeight:700, fontSize:'14px', marginTop:'8px'}}>최근 학습 기록이 없어요</div>
          <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>학습을 시작하면 여기에 기록이 표시됩니다</div>
          <button onClick={()=>location.href='/learn'} style={{marginTop:'16px', background:'#2563EB', color:'white', border:'none', borderRadius:'10px', padding:'10px 20px', fontSize:'13px', fontWeight:700}}>학습 시작하기</button>
        </div>
      </div>
    </main>
  )
}
