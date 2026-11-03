
'use client'
import { useEffect, useState } from 'react'

function isAdminUser(loginId:string, role:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return role==='ADMIN' || id.includes('parkhy5454') || id.includes('parkhy')
}
function canSelfPromote(loginId:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return id.includes('parkhy5454') || id.includes('parkhy') || id==='admin' || id==='demo'
}

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPw, setShowPw] = useState<{[k:string]:boolean}>({})

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      if(isAdminUser(d.user?.loginId, d.user?.role)) loadData()
    }).catch(()=>setLoading(false))
  },[])

  function loadData(){
    fetch('/api/admin/users').then(r=>r.json()).then(d=> setUsers(Array.isArray(d)? d : d.users || [])).catch(()=>{})
    fetch('/api/admin/purchases').then(r=>r.json()).then(d=> setPurchases(Array.isArray(d)? d : [])).catch(()=>{})
  }
  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  async function handleMakeAdmin(){
    if(!user) return
    const res = await fetch('/api/admin/make-admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId: user.loginId})})
    if(res.ok){ alert('관리자로 승격 완료!'); location.reload() } else { const j=await res.json(); alert('실패:'+j.error) }
  }
  async function handleResetPw(loginId:string){
    const newPw = prompt(`${loginId} 새 비밀번호:`)
    if(!newPw) return
    const res = await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId, newPassword:newPw})})
    if(res.ok){ alert(`${loginId} 비번이 ${newPw}로 변경됨`); loadData() } else { const j=await res.json(); alert('실패:'+j.error) }
  }

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요 <a href="/login">로그인</a></main>

  const isAdmin = isAdminUser(user.loginId, user.role)
  const canPromote = !isAdmin && canSelfPromote(user.loginId)
  const filtered = users.filter((u:any)=> !search || u.loginId?.toLowerCase().includes(search.toLowerCase()) || u.name?.includes(search))

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px', fontWeight:800}}>⚙️ MY / 설정</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:700}}>내 정보 {isAdmin && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'6px'}}>배포자 관리자</span>}</div>
        <div style={{marginTop:'10px', fontSize:'14px', display:'grid', gap:'6px'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>아이디</span><span style={{fontWeight:600, fontSize:'12px', wordBreak:'break-all'}}>{user.loginId}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>권한</span><span style={{fontWeight:700, color: isAdmin ? '#DC2626' : '#6B7280'}}>{isAdmin ? 'ADMIN (배포자)' : '일반회원'}</span></div>
        </div>
        {canPromote && (
          <button onClick={handleMakeAdmin} style={{width:'100%', marginTop:'12px', background:'#FFD60A', border:'none', padding:'14px', borderRadius:'12px', fontWeight:800, cursor:'pointer'}}>🔑 내 계정을 관리자로 승격 (배포자 전용)</button>
        )}
      </div>

      {isAdmin ? (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
          <div style={{fontWeight:800, fontSize:'16px'}}>👥 회원 가입자 관리 (전체) - {users.length}명</div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', margin:'16px 0'}}>
            <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px', fontWeight:800}}>{users.length}</div><div style={{fontSize:'11px', color:'#6B7280'}}>총 회원</div></div>
            <div style={{background:'#FFF7CC', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'16px', fontWeight:800}}>{purchases.reduce((a:any,b:any)=>a+(b.amount||0),0).toLocaleString()}원</div><div style={{fontSize:'11px', color:'#92400E'}}>총 매출</div></div>
            <div style={{background:'#E0F2FE', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px', fontWeight:800}}>{purchases.length}</div><div style={{fontSize:'11px', color:'#0369A1'}}>결제 건수</div></div>
          </div>

          <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 전화번호 검색" style={{flex:1, padding:'12px', borderRadius:'12px', border:'1px solid #E5E7EB', fontSize:'13px'}} />
            <button onClick={loadData} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'12px 16px', fontWeight:800, cursor:'pointer'}}>새로고침</button>
          </div>

          <div style={{display:'grid', gap:'10px', maxHeight:'700px', overflow:'auto'}}>
            {filtered.map((u:any)=>{
              const ups = purchases.filter((p:any)=>p.userId===u.id || p.userId===u.loginId)
              const totalPaid = ups.reduce((a:any,b:any)=>a+(b.amount||0),0)
              return (
                <div key={u.id} style={{border:'1px solid #F3F4F6', borderRadius:'16px', padding:'14px', background:'white'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800, fontSize:'12px', wordBreak:'break-all'}}>{u.loginId} {isAdminUser(u.loginId, u.role) && <span style={{background:'#FFD60A', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>관리자</span>}</div>
                      <div style={{fontSize:'13px', fontWeight:600, marginTop:'2px'}}>{u.name}</div>
                    </div>
                    <button onClick={()=>handleResetPw(u.loginId)} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'8px 14px', fontSize:'11px', fontWeight:700, cursor:'pointer', marginLeft:'8px'}}>🔑 비번 수정</button>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'10px'}}>
                    <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}>
                      <div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>아이디 / 비밀번호</div>
                      <div style={{fontSize:'11px', marginTop:'4px', wordBreak:'break-all'}}>🆔 {u.loginId}<div style={{marginTop:'4px', display:'flex', gap:'4px'}}>🔑 {showPw[u.id] ? (u.password?.slice(0,20)||'해시') : '••••••••'}<button onClick={()=>setShowPw({...showPw, [u.id]: !showPw[u.id]})} style={{fontSize:'10px', background:'white', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'2px 6px', cursor:'pointer'}}>{showPw[u.id]?'숨김':'보기'}</button></div></div>
                    </div>
                    <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}>
                      <div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>전화번호 / 이름</div>
                      <div style={{fontSize:'11px', marginTop:'4px'}}><div>📞 {u.phone}</div><div>👤 {u.name}</div><div style={{fontSize:'10px', color:'#9CA3AF'}}>{new Date(u.createdAt).toLocaleString('ko-KR')}</div></div>
                    </div>
                    <div style={{background:'#FFF7CC', borderRadius:'10px', padding:'10px'}}>
                      <div style={{fontSize:'10px', color:'#92400E', fontWeight:700}}>관심 자격증</div>
                      <div style={{marginTop:'4px', fontSize:'10px'}}>{u.interests?.length ? u.interests.map((i:string)=><span key={i} style={{display:'inline-block', background:'white', padding:'2px 6px', borderRadius:'6px', margin:'2px'}}>{i}</span>) : '없음'}</div>
                    </div>
                    <div style={{background: ups.length ? '#DCFCE7' : '#F3F4F6', borderRadius:'10px', padding:'10px'}}>
                      <div style={{fontSize:'10px', color: ups.length ? '#15803D' : '#6B7280', fontWeight:700}}>결제 현황</div>
                      <div style={{fontSize:'11px', marginTop:'4px'}}>{ups.length ? `${totalPaid.toLocaleString()}원 / ${ups.length}건` : '미결제'}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <button onClick={logout} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
    </main>
  )
}
