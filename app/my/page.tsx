
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('referral')
  const [stats, setStats] = useState<any>({count:0, paidCount:0, points:0})
  const [copied, setCopied] = useState('')
  const router = useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(()=>{})
    fetch('/api/referral/stats').then(r=>r.json()).then(setStats).catch(()=>{})
  },[])

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F5F7FB', minHeight:'100vh'}}>로딩중...</div>

  const referralCode = `${user.loginId||'user'}-CMVZ`
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referralCode}` : ''

  function copy(text:string, type:string){
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(()=>setCopied(''), 2000)
  }

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:'16px 16px 0'}}>
        {/* 헤더 */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e'}}>MY / 설정</div>
          <button onClick={async()=>{ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }} style={{padding:'8px 14px', background:'#FFE0E0', color:'#C53030', border:'none', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer'}}>로그아웃</button>
        </div>

        {/* 내 정보 */}
        <div style={{background:'white', borderRadius:16, padding:16, marginBottom:12, border:'1px solid #EEF2F7'}}>
          <div style={{display:'flex', gap:6, alignItems:'center', marginBottom:6}}>
            <span style={{fontSize:13, fontWeight:700, color:'#1a1a2e'}}>내 정보</span>
            <span style={{fontSize:10, background:'#FFD600', padding:'2px 8px', borderRadius:10, fontWeight:700}}>배포자 관리자</span>
          </div>
          <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e'}}>{user.loginId} / ADMIN</div>
          <div style={{fontSize:11, color:'#888', marginTop:2}}>관심: 건축전기설비기사 / 포인트: {stats.points||0}P</div>
        </div>

        {/* 탭 - 검정 버튼을 밝게 변경! */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
          <button 
            onClick={()=>setActiveTab('referral')}
            style={{
              padding:'12px', 
              background: activeTab==='referral' ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white',
              color: activeTab==='referral' ? '#1a1a2e' : '#888',
              border: activeTab==='referral' ? 'none' : '1px solid #EEF2F7',
              borderRadius:12, 
              fontSize:13, 
              fontWeight: activeTab==='referral' ? 800 : 600, 
              cursor:'pointer',
              boxShadow: activeTab==='referral' ? '0 4px 12px rgba(255,214,0,0.3)' : 'none'
            }}
          >
            {activeTab==='referral' ? '🎁 친구추천' : '친구추천'}
          </button>
          <button onClick={()=>setActiveTab('members')} style={{padding:'12px', background:'white', color:'#888', border:'1px solid #EEF2F7', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer'}}>회원 {stats.count||0}</button>
          <button onClick={()=>setActiveTab('pdf')} style={{padding:'12px', background:'white', color:'#888', border:'1px solid #EEF2F7', borderRadius:12, fontSize:13, fontWeight:600, cursor:'pointer'}}>PDF {stats.pdfCount||0}</button>
        </div>

        {/* 친구 추천 포인트 - 밝은 디자인 유지 + 복사 버튼만 변경 */}
        <div style={{background:'white', borderRadius:16, padding:16, border:'2px solid #FFE066', marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
            <div style={{fontSize:14, fontWeight:800, color:'#1a1a2e'}}>친구 추천 포인트</div>
            <span style={{fontSize:10, background:'#FFD600', padding:'4px 8px', borderRadius:10, fontWeight:700}}>최대 5000P</span>
          </div>
          <div style={{fontSize:11, color:'#666', marginBottom:4}}>친구가 <b>가입하면 1000P</b>, <b>결제하면 5000P</b> 추가!</div>
          <div style={{fontSize:11, color:'#666', marginBottom:12, display:'flex', alignItems:'center', gap:6}}>
            내 추천코드: <span style={{background:'#F1F3F5', padding:'2px 8px', borderRadius:6, fontWeight:700, fontSize:11}}>{referralCode}</span>
          </div>

          {/* 공유 버튼 - 복사 버튼만 밝게 변경! */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:12}}>
            <button onClick={()=>{}} style={{padding:'12px 4px', background:'#FFF9DB', border:'1.5px solid #FFE066', borderRadius:12, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
              <span style={{fontSize:18, background:'#FFD600', width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center'}}>💬</span>카톡
            </button>
            <button style={{padding:'12px 4px', background:'#FFF0F5', border:'1.5px solid #FFB6D9', borderRadius:12, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
              <span style={{fontSize:16}}>💌</span>문자
            </button>
            <button style={{padding:'12px 4px', background:'#F0F4FF', border:'1.5px solid #B6D0FF', borderRadius:12, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
              <span style={{fontSize:16}}>📧</span>이메일
            </button>
            {/* 복사 버튼 - 검정 → 밝은 파란색으로 변경! */}
            <button 
              onClick={()=>copy(referralLink, 'link')}
              style={{
                padding:'12px 4px', 
                background: copied==='link' ? '#34A853' : 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)', 
                border:'none', 
                borderRadius:12, 
                fontSize:11, 
                fontWeight:700, 
                cursor:'pointer', 
                color:'white',
                display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                boxShadow: '0 2px 8px rgba(66,133,244,0.3)',
                transition:'all 0.2s'
              }}
            >
              <span style={{fontSize:16}}>{copied==='link' ? '✓' : '🔗'}</span>{copied==='link' ? '복사됨!' : '복사'}
            </button>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
            <div style={{background:'#F8F9FA', borderRadius:10, padding:10, textAlign:'center'}}>
              <div style={{fontSize:16, fontWeight:800, color:'#4285F4'}}>{stats.count||0}명</div>
              <div style={{fontSize:10, color:'#888', marginTop:2}}>추천 가입</div>
            </div>
            <div style={{background:'#F8F9FA', borderRadius:10, padding:10, textAlign:'center'}}>
              <div style={{fontSize:16, fontWeight:800, color:'#34A853'}}>{stats.paidCount||0}명</div>
              <div style={{fontSize:10, color:'#888', marginTop:2}}>결제 완료</div>
            </div>
            <div style={{background:'#F8F9FA', borderRadius:10, padding:10, textAlign:'center'}}>
              <div style={{fontSize:16, fontWeight:800, color:'#FB8C00'}}>{stats.points||0}P</div>
              <div style={{fontSize:10, color:'#888', marginTop:2}}>받은 포인트</div>
            </div>
          </div>

          <div style={{background:'#FFF9DB', borderRadius:8, padding:10, fontSize:10, color:'#8B6914', wordBreak:'break-all', lineHeight:'1.4'}}>
            추천링크: https://fastpass-fvmdt8hlb-tony-team4.vercel.app/signup?ref={referralCode}
          </div>
        </div>

        {/* 하단 로그아웃 - 빨강 유지 (검정이 아니라서 그대로) */}
        <button onClick={async()=>{ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }} style={{width:'100%', padding:14, background:'#E53E3E', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:80}}>
          로그아웃 - {user.loginId}
        </button>
      </div>
    </div>
  )
}
