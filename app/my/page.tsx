
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const CARDS = [
  {id:'profile', title:'내 프로필', desc:'정보 수정, 비밀번호 변경', icon:'👤', color:'#E8F0FE', iconBg:'#4285F4'},
  {id:'my-questions', title:'내 문제 관리', desc:'등록한 문제, 즐겨찾기', icon:'📝', color:'#E6F4EA', iconBg:'#34A853'},
  {id:'wrong-notes', title:'오답노트', desc:'틀린 문제 복습', icon:'📒', color:'#FEF3E2', iconBg:'#FB8C00'},
  {id:'bookmarks', title:'즐겨찾기', desc:'저장한 문제 모음', icon:'⭐', color:'#FFF8E1', iconBg:'#FBC02D'},
  {id:'referral', title:'친구 추천', desc:'추천하고 포인트 받기', icon:'🎁', color:'#FCE4EC', iconBg:'#E91E63'},
  {id:'pdf', title:'PDF 관리', desc:'내 교재, 업로드', icon:'📚', color:'#EDE7F6', iconBg:'#7C4DFF'},
  {id:'admin', title:'관리자 대시보드', desc:'회원, 결제, 통계 관리', icon:'⚙️', color:'#E0F2F1', iconBg:'#00897B'},
]

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [active, setActive] = useState('profile')
  const [referralStats, setReferralStats] = useState<any>(null)
  const router = useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
      // 친구추천 탭 기본으로 보여주기
      if(d.user.role !== 'ADMIN') setActive('referral')
    }).catch(()=>{})
    fetch('/api/referral/stats').then(r=>r.json()).then(setReferralStats).catch(()=>{})
  },[])

  if(!user) return <div style={{padding:40, textAlign:'center'}}>로딩중...</div>

  const isAdmin = user.role === 'ADMIN' || user.loginId?.includes('parkhy5454')

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', paddingBottom:100}}>
      {/* 헤더 */}
      <div style={{background:'white', padding:'20px 20px 16px', borderBottom:'1px solid #EEF2F7'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:22, fontWeight:800, color:'#1a1a2e'}}>MY 페이지</div>
            <div style={{fontSize:13, color:'#888', marginTop:2}}>{user.name||user.loginId}님, 환영합니다! {isAdmin && '👑 관리자'}</div>
          </div>
          <button onClick={async()=>{ await fetch('/api/auth/logout', {method:'POST'}); window.location.href='/login' }} style={{padding:'8px 14px', background:'#F1F3F5', border:'1px solid #E9ECEF', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer'}}>로그아웃</button>
        </div>
      </div>

      <div style={{padding:16, maxWidth:480, margin:'0 auto'}}>
        {/* 프로필 요약 카드 - 밝게! */}
        <div style={{background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', borderRadius:20, padding:20, marginBottom:16, display:'flex', alignItems:'center', gap:14, boxShadow:'0 4px 12px rgba(255,214,0,0.3)'}}>
          <div style={{width:56, height:56, background:'white', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'#1a1a2e'}}>
            {(user.name||user.loginId||'U')[0].toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:17, fontWeight:800, color:'#1a1a2e'}}>{user.name||user.loginId}</div>
            <div style={{fontSize:12, color:'rgba(0,0,0,0.6)', marginTop:2}}>{user.loginId} {user.email && `• ${user.email}`}</div>
            <div style={{fontSize:11, background:'rgba(0,0,0,0.1)', display:'inline-block', padding:'2px 8px', borderRadius:10, marginTop:6, fontWeight:600}}>{user.role||'USER'} {isAdmin && '• 관리자'}</div>
          </div>
          <div style={{fontSize:20}}>👋</div>
        </div>

        {/* 포인트 카드 */}
        {referralStats && (
          <div style={{background:'white', borderRadius:16, padding:16, marginBottom:16, display:'flex', justifyContent:'space-around', border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e'}}>{referralStats.count||0}</div>
              <div style={{fontSize:11, color:'#888', marginTop:2}}>추천한 친구</div>
            </div>
            <div style={{width:1, background:'#EEF2F7'}}></div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#E91E63'}}>{(referralStats.points||0).toLocaleString()}P</div>
              <div style={{fontSize:11, color:'#888', marginTop:2}}>적립 포인트</div>
            </div>
            <div style={{width:1, background:'#EEF2F7'}}></div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:20, fontWeight:800, color:'#00897B'}}>{referralStats.paidCount||0}</div>
              <div style={{fontSize:11, color:'#888', marginTop:2}}>결제 완료</div>
            </div>
          </div>
        )}

        {/* 카드 그리드 - 밝고 잘 보이는 디자인! */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
          {CARDS.filter(c=> c.id!=='admin' || isAdmin).map(card=>(
            <button 
              key={card.id} 
              onClick={()=>setActive(card.id)}
              style={{
                background: active===card.id ? 'white' : 'white',
                border: active===card.id ? '2px solid #1a1a2e' : '1px solid #EEF2F7',
                borderRadius:16, 
                padding:16, 
                textAlign:'left', 
                cursor:'pointer',
                boxShadow: active===card.id ? '0 4px 12px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                transform: active===card.id ? 'scale(0.98)' : 'scale(1)',
                transition:'all 0.15s',
                position:'relative'
              }}
            >
              <div style={{width:40, height:40, background:card.color, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:10}}>
                {card.icon}
              </div>
              <div style={{fontSize:14, fontWeight:700, color:'#1a1a2e', lineHeight:'1.2'}}>{card.title}</div>
              <div style={{fontSize:11, color:'#888', marginTop:4, lineHeight:'1.3'}}>{card.desc}</div>
              {active===card.id && <div style={{position:'absolute', top:10, right:10, width:8, height:8, background:'#FFD600', borderRadius:'50%'}}></div>}
            </button>
          ))}
        </div>

        {/* 선택된 콘텐츠 영역 */}
        <div style={{background:'white', borderRadius:16, padding:20, border:'1px solid #EEF2F7', minHeight:200}}>
          {active==='referral' && <ReferralContent stats={referralStats} user={user} />}
          {active==='profile' && <ProfileContent user={user} />}
          {active!=='referral' && active!=='profile' && <div style={{textAlign:'center', padding:40, color:'#888'}}><div style={{fontSize:32, marginBottom:8}}>{CARDS.find(c=>c.id===active)?.icon}</div><div>{CARDS.find(c=>c.id===active)?.title} 준비중</div></div>}
        </div>

        {/* 하단 로그아웃 버튼 3번째 */}
        <button onClick={async()=>{ await fetch('/api/auth/logout', {method:'POST'}); window.location.href='/login' }} style={{width:'100%', marginTop:16, padding:14, background:'#FFF1F1', color:'#E53E3E', border:'1px solid #FFE0E0', borderRadius:12, fontWeight:600, cursor:'pointer'}}>
          로그아웃
        </button>
      </div>
    </div>
  )
}

function ReferralContent({stats, user}: any){
  const code = `${user.loginId||'user'}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
  const link = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${user.loginId}` : ''
  const [copied, setCopied] = useState(false)

  return (
    <div>
      <div style={{fontSize:16, fontWeight:800, marginBottom:4}}>🎁 친구 추천</div>
      <div style={{fontSize:12, color:'#888', marginBottom:16}}>친구가 가입하면 1,000P, 결제하면 5,000P!</div>

      <div style={{background:'#F8F9FA', borderRadius:12, padding:14, marginBottom:12}}>
        <div style={{fontSize:11, color:'#888', marginBottom:6}}>내 추천 코드</div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{flex:1, background:'white', border:'1px solid #E9ECEF', borderRadius:8, padding:'10px 12px', fontWeight:700, fontSize:14}}>{code}</div>
          <button onClick={()=>{navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000)}} style={{padding:'10px 16px', background:'#1a1a2e', color:'white', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer'}}>{copied?'복사됨!':'복사'}</button>
        </div>
      </div>

      <div style={{background:'#FFF9DB', border:'1px solid #FFE066', borderRadius:12, padding:14, marginBottom:16}}>
        <div style={{fontSize:12, fontWeight:600, marginBottom:8}}>📤 공유하기</div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>window.open(`https://open.kakao.com`)} style={{flex:1, padding:10, background:'#FEE500', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer'}}>카톡</button>
          <button onClick={()=>{ if(navigator.share) navigator.share({title:'자격증 패스트패스', url:link}).catch(()=>{}); else { navigator.clipboard.writeText(link); alert('링크 복사됨!') } }} style={{flex:1, padding:10, background:'white', border:'1px solid #E9ECEF', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer'}}>링크 복사</button>
          <button onClick={()=>window.open(`sms:?&body=${encodeURIComponent('자격증 패스트패스 추천! '+link)}`)} style={{flex:1, padding:10, background:'white', border:'1px solid #E9ECEF', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer'}}>문자</button>
        </div>
      </div>

      {stats?.referredUsers?.length > 0 && (
        <div>
          <div style={{fontSize:13, fontWeight:700, marginBottom:8}}>추천한 친구 {stats.referredUsers.length}명</div>
          {stats.referredUsers.slice(0,5).map((u:any)=>(
            <div key={u.id} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F1F3F5', fontSize:13}}>
              <span>{u.name||u.loginId}</span><span style={{color: u.hasPaid ? '#00897B' : '#888', fontSize:11}}>{u.hasPaid ? '결제 완료 +5000P' : '가입 완료 +1000P'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileContent({user}: any){
  return (
    <div>
      <div style={{fontSize:16, fontWeight:800, marginBottom:16}}>👤 내 프로필</div>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <div><div style={{fontSize:11, color:'#888', marginBottom:4}}>아이디</div><div style={{padding:'12px', background:'#F8F9FA', borderRadius:8, fontSize:14}}>{user.loginId}</div></div>
        <div><div style={{fontSize:11, color:'#888', marginBottom:4}}>이름</div><div style={{padding:'12px', background:'#F8F9FA', borderRadius:8, fontSize:14}}>{user.name||'-'}</div></div>
        <div><div style={{fontSize:11, color:'#888', marginBottom:4}}>이메일</div><div style={{padding:'12px', background:'#F8F9FA', borderRadius:8, fontSize:14}}>{user.email||'-'}</div></div>
        <div><div style={{fontSize:11, color:'#888', marginBottom:4}}>역할</div><div style={{padding:'12px', background:'#FFF9DB', borderRadius:8, fontSize:14, fontWeight:600}}>{user.role||'USER'}</div></div>
      </div>
    </div>
  )
}
