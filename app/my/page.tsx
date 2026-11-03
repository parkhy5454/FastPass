
'use client'
import { useEffect, useState } from 'react'

function isAdminUser(loginId:string, role:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return role==='ADMIN' || id.includes('parkhy5454') || id==='admin' || id.includes('admin@') || id==='demo' || id==='modio' || id==='tony' || (id.includes('parkhy') && id.includes('gmail'))
}

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [stats, setStats] = useState<any>({totalUsers:0, totalRevenue:0})
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'users'|'payments'>('users')
  const [showPw, setShowPw] = useState<{[k:string]:boolean}>({})
  const [loading, setLoading] = useState(true)

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
    fetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>{})
  }

  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  
  async function handleResetPw(loginId:string){
    const newPw = prompt(`${loginId}의 새 비밀번호를 입력하세요 (예: 1234):\n\n사용자에게 이 비번을 알려주세요.`)
    if(!newPw) return
    if(!confirm(`${loginId}의 비밀번호를 "${newPw}"로 변경할까요?`)) return
    const res = await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId, newPassword:newPw})})
    const j = await res.json()
    if(res.ok){ alert(`✅ 성공!\n${loginId} 비번이 "${newPw}"로 변경됨\n사용자에게 알려주세요.`); loadData() }
    else alert('실패: '+(j.error||''))
  }

  async function handleMakeAdmin(){
    if(!user) return
    if(!confirm(`${user.loginId}를 관리자로 승격할까요?`)) return
    const res = await fetch('/api/admin/make-admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId: user.loginId})})
    const j = await res.json()
    if(res.ok){ alert('✅ 관리자로 승격 완료! 새로고침합니다.'); location.reload() }
    else alert('실패: '+j.error)
  }

  const filtered = users.filter((u:any)=> !search || u.loginId?.toLowerCase().includes(search.toLowerCase()) || u.name?.includes(search) || u.phone?.includes(search))

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요 <a href="/login">로그인</a></main>

  const isAdmin = isAdminUser(user.loginId, user.role)

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px', fontWeight:800}}>⚙️ MY / 설정 - 회원 관리</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
        <div style={{fontWeight:700}}>내 정보 {isAdmin && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'6px'}}>배포자 관리자</span>}</div>
        <div style={{marginTop:'10px', fontSize:'14px', display:'grid', gap:'6px'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>아이디</span><span style={{fontWeight:600, fontSize:'12px', wordBreak:'break-all'}}>{user.loginId}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>이름</span><span style={{fontWeight:600}}>{user.name}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>권한</span><span style={{fontWeight:700, color: isAdmin ? '#DC2626' : '#6B7280'}}>{isAdmin ? 'ADMIN (배포자)' : 'USER'}</span></div>
        </div>
        {!isAdmin && (
          <div style={{marginTop:'12px'}}>
            <div style={{background:'#FEF2F2', padding:'12px', borderRadius:'12px', fontSize:'12px', color:'#991B1B'}}>
              ⚠️ 관리자 권한이 없습니다.<br/>현재 아이디: {user.loginId}<br/>parkhy5454 포함 아이디는 자동 관리자입니다.
            </div>
            <button onClick={handleMakeAdmin} style={{width:'100%', marginTop:'10px', background:'#FFD60A', border:'none', padding:'14px', borderRadius:'12px', fontWeight:800, cursor:'pointer', fontSize:'14px'}}>🔑 내 계정을 관리자로 승격 (클릭!)</button>
          </div>
        )}
      </div>

      {isAdmin ? (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
          <div style={{fontWeight:800, fontSize:'16px'}}>👥 회원 가입자 관리 (전체) - {users.length}명</div>
          <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'4px'}}>아이디 / 비밀번호 수정 / 전화번호 / 관심자격증 / 이름 / 결제현황</div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', margin:'16px 0'}}>
            <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px', fontWeight:800}}>{users.length}</div><div style={{fontSize:'11px', color:'#6B7280'}}>총 회원</div></div>
            <div style={{background:'#FFF7CC', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'16px', fontWeight:800}}>{purchases.reduce((a:any,b:any)=>a+(b.amount||0),0).toLocaleString()}원</div><div style={{fontSize:'11px', color:'#92400E'}}>총 매출</div></div>
            <div style={{background:'#E0F2FE', borderRadius:'12px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px', fontWeight:800}}>{purchases.length}</div><div style={{fontSize:'11px', color:'#0369A1'}}>결제 건수</div></div>
          </div>

          <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
            <button onClick={()=>setActiveTab('users')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: activeTab==='users'?'#111827':'#F3F4F6', color: activeTab==='users'?'white':'#6B7280', cursor:'pointer'}}>회원 {users.length}명</button>
            <button onClick={()=>setActiveTab('payments')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: activeTab==='payments'?'#111827':'#F3F4F6', color: activeTab==='payments'?'white':'#6B7280', cursor:'pointer'}}>결제 {purchases.length}건</button>
          </div>

          {activeTab==='users' && (
            <div>
              <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 전화번호 검색" style={{flex:1, padding:'12px', borderRadius:'12px', border:'1px solid #E5E7EB', fontSize:'13px'}} />
                <button onClick={loadData} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'12px 16px', fontWeight:800, cursor:'pointer'}}>새로고침</button>
              </div>

              <div style={{display:'grid', gap:'10px', maxHeight:'700px', overflow:'auto'}}>
                {filtered.map((u:any)=>{
                  const ups = purchases.filter((p:any)=>p.userId===u.id || p.userId===u.loginId)
                  const totalPaid = ups.reduce((a:any,b:any)=>a+(b.amount||0),0)
                  const hasPaid = ups.length>0
                  return (
                    <div key={u.id} style={{border:'1px solid #F3F4F6', borderRadius:'16px', padding:'14px', background:'white'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:800, fontSize:'13px', wordBreak:'break-all', display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center'}}>
                            {u.loginId}
                            {isAdminUser(u.loginId, u.role) && <span style={{background:'#FFD60A', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>관리자</span>}
                            {hasPaid ? <span style={{background:'#DCFCE7', color:'#15803D', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>결제 {totalPaid.toLocaleString()}원</span> : <span style={{background:'#F3F4F6', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>무료</span>}
                          </div>
                          <div style={{fontSize:'13px', fontWeight:600, marginTop:'2px'}}>{u.name}</div>
                        </div>
                        <button onClick={()=>handleResetPw(u.loginId)} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'8px 14px', fontSize:'11px', fontWeight:700, cursor:'pointer', flexShrink:0, marginLeft:'8px'}}>🔑 비번 수정</button>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'10px'}}>
                        <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>아이디 / 비밀번호</div>
                          <div style={{fontSize:'11px', marginTop:'4px', wordBreak:'break-all'}}>
                            <div>🆔 {u.loginId}</div>
                            <div style={{marginTop:'4px', display:'flex', alignItems:'center', gap:'4px'}}>
                              🔑 {showPw[u.id] ? (u.password?.slice(0,30) || '해시') : '••••••••'}
                              <button onClick={()=>setShowPw({...showPw, [u.id]: !showPw[u.id]})} style={{fontSize:'10px', background:'white', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'2px 6px', cursor:'pointer'}}>{showPw[u.id] ? '숨김' : '보기'}</button>
                            </div>
                            <div style={{fontSize:'10px', color:'#6B7280', marginTop:'4px'}}>↑ [🔑 비번 수정] 버튼으로 변경 가능</div>
                          </div>
                        </div>
                        <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>전화번호 / 이름 / 가입일</div>
                          <div style={{fontSize:'11px', marginTop:'4px'}}>
                            <div>📞 {u.phone}</div>
                            <div style={{marginTop:'2px'}}>👤 {u.name}</div>
                            <div style={{marginTop:'2px', fontSize:'10px', color:'#9CA3AF'}}>{new Date(u.createdAt).toLocaleString('ko-KR')}</div>
                          </div>
                        </div>
                        <div style={{background:'#FFF7CC', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color:'#92400E', fontWeight:700}}>관심 자격증</div>
                          <div style={{marginTop:'4px', fontSize:'10px'}}>
                            {u.interests?.length ? u.interests.map((i:string)=><span key={i} style={{display:'inline-block', background:'white', padding:'2px 6px', borderRadius:'6px', margin:'2px'}}>{i}</span>) : '없음'}
                          </div>
                        </div>
                        <div style={{background: hasPaid ? '#DCFCE7' : '#F3F4F6', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color: hasPaid ? '#15803D' : '#6B7280', fontWeight:700}}>결제 / 구독 현황</div>
                          <div style={{fontSize:'11px', marginTop:'4px'}}>
                            {hasPaid ? (
                              <>
                                <div style={{fontWeight:700, color:'#15803D'}}>{totalPaid.toLocaleString()}원 / {ups.length}건</div>
                                <div style={{fontSize:'10px', marginTop:'2px'}}>{ups[0]?.flipbookId || '구독'}</div>
                                <div style={{fontSize:'10px'}}>{ups[0]?.verified ? '✅ 검증' : '⏳ 미검증'}</div>
                              </>
                            ) : <div style={{color:'#6B7280'}}>미결제 (무료)</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filtered.length===0 && <div style={{padding:'40px', textAlign:'center', color:'#9CA3AF'}}>회원 {users.length}명 (검색 결과 없음)</div>}
              </div>

              <button onClick={()=>{
                const headers = ['아이디','이름','전화번호','관심자격증','역할','가입일','결제금액','결제건수']
                const rows = users.map((u:any)=>{
                  const ups = purchases.filter((p:any)=>p.userId===u.id || p.userId===u.loginId)
                  const total = ups.reduce((a:any,b:any)=>a+(b.amount||0),0)
                  return [`"${u.loginId}"`,`"${u.name}"`,`"${u.phone}"`,`"${(u.interests||[]).join(',')}"`,`"${u.role}"`,`"${u.createdAt}"`,total,ups.length].join(',')
                })
                const csv = [headers.join(','), ...rows].join('\n')
                const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'})
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href=url; a.download=`회원_${new Date().toISOString().slice(0,10)}.csv`; a.click()
              }} style={{width:'100%', marginTop:'12px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>📥 엑셀 CSV 다운로드</button>
            </div>
          )}

          {activeTab==='payments' && (
            <div>
              {purchases.length===0 ? <div style={{padding:'40px', textAlign:'center', color:'#6B7280'}}>결제 내역 없음</div> :
                purchases.map((p:any)=>(
                  <div key={p.id} style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px', marginBottom:'8px', display:'flex', justifyContent:'space-between'}}>
                    <div><div style={{fontWeight:700, fontSize:'13px'}}>{p.user?.loginId || p.userId?.slice(0,12)}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{new Date(p.createdAt).toLocaleString()}</div></div>
                    <div style={{fontWeight:800, color:'#10B981'}}>{p.amount?.toLocaleString()}원</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      ) : null}

      <button onClick={logout} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
    </main>
  )
}
