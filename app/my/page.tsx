
'use client'
import { useEffect, useState } from 'react'

function isAdminUser(loginId:string, role:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return role==='ADMIN' || 
         id.includes('parkhy5454') || 
         id==='admin' || id.includes('admin@') ||
         id==='demo' || id==='modio' || id==='tony' || id==='test' ||
         id.includes('@gmail.com') && id.includes('parkhy') // your gmail
}

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [stats, setStats] = useState<any>({totalUsers:0, totalRevenue:0, todayJoins:0})
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'users'|'payments'|'stats'>('users')
  const [showPasswords, setShowPasswords] = useState<{[key:string]:boolean}>({})
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      const isAdmin = isAdminUser(d.user?.loginId, d.user?.role)
      if(isAdmin){
        loadData()
      }
    }).catch(()=>setLoading(false))
  },[])

  function loadData(){
    fetch('/api/admin/users').then(r=>r.json()).then(data=> {
      const list = Array.isArray(data)? data : data.users || []
      setUsers(list)
    }).catch(()=>{})
    fetch('/api/admin/purchases').then(r=>r.json()).then(data=> setPurchases(Array.isArray(data)? data : [])).catch(()=>{})
    fetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>{})
  }

  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  
  async function resetPassword(loginId:string){
    const newPw = prompt(`${loginId}의 새 비밀번호를 입력하세요:`)
    if(!newPw) return
    const res = await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId, newPassword:newPw})})
    if(res.ok){ alert(`${loginId} 비밀번호가 ${newPw}로 변경되었습니다.`); loadData() }
    else { const j=await res.json(); alert('실패: '+j.error) }
  }

  const filteredUsers = users.filter((u:any)=> 
    !search || u.loginId?.toLowerCase().includes(search.toLowerCase()) || u.name?.includes(search) || u.phone?.includes(search)
  )

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인이 필요합니다. <a href="/login">로그인</a></main>

  const isAdminView = isAdminUser(user.loginId, user.role)

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, margin:'8px 0 16px'}}>⚙️ MY / 설정 - 회원 관리</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
        <div style={{fontWeight:700}}>내 정보 {isAdminView && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'8px'}}>배포자 관리자</span>}</div>
        <div style={{marginTop:'12px', display:'grid', gap:'8px', fontSize:'14px'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>아이디</span><span style={{fontWeight:600, fontSize:'12px'}}>{user.loginId}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>이름</span><span style={{fontWeight:600}}>{user.name}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>권한</span><span style={{fontWeight:600, color: isAdminView ? '#DC2626' : '#6B7280'}}>{isAdminView ? 'ADMIN (배포자)' : 'USER'}</span></div>
        </div>
        {!isAdminView && (
          <div style={{marginTop:'12px', background:'#FEF2F2', padding:'10px', borderRadius:'10px', fontSize:'11px', color:'#DC2626'}}>
            ⚠️ 관리자 권한이 없습니다. 현재 아이디: {user.loginId}<br/>
            parkhy5454가 포함된 아이디로 로그인하거나, Neon SQL에서 UPDATE "User" SET "role"='ADMIN' WHERE "loginId"='{user.loginId}';
          </div>
        )}
      </div>

      {isAdminView ? (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <div style={{fontWeight:800, fontSize:'16px'}}>👥 회원 가입자 관리 (전체)</div>
          <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'16px', marginTop:'4px'}}>아이디 / 비밀번호 / 전화번호 / 관심자격증 / 이름 / 결제 현황</div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'16px'}}>
            <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'22px', fontWeight:800}}>{users.length}</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>총 회원</div>
            </div>
            <div style={{background:'#FFF7CC', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'18px', fontWeight:800}}>{purchases.reduce((a:any,b:any)=>a+(b.amount||0),0).toLocaleString()}원</div>
              <div style={{fontSize:'11px', color:'#92400E'}}>총 매출</div>
            </div>
            <div style={{background:'#E0F2FE', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'22px', fontWeight:800}}>{users.filter((u:any)=>purchases.some((p:any)=>p.userId===u.id || p.userId===u.loginId)).length}</div>
              <div style={{fontSize:'11px', color:'#0369A1'}}>결제 회원</div>
            </div>
          </div>

          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            {(['users','payments','stats'] as const).map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontSize:'12px', fontWeight:700, cursor:'pointer', background: activeTab===tab ? '#111827' : '#F3F4F6', color: activeTab===tab ? 'white' : '#6B7280'}}>
                {tab==='users' ? `회원 ${users.length}명` : tab==='payments' ? `결제 ${purchases.length}건` : '통계'}
              </button>
            ))}
          </div>

          {activeTab==='users' && (
            <div>
              <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 전화번호 검색" style={{flex:1, padding:'12px', borderRadius:'12px', border:'1px solid #E5E7EB', fontSize:'13px', boxSizing:'border-box'}} />
                <button onClick={loadData} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'12px 16px', fontWeight:800, fontSize:'12px', cursor:'pointer'}}>새로고침</button>
              </div>
              
              <div style={{marginTop:'8px', display:'grid', gap:'8px', maxHeight:'600px', overflow:'auto'}}>
                {filteredUsers.map((u:any)=>{
                  const userPurchases = purchases.filter((p:any)=>p.userId===u.id || p.userId===u.loginId || p.user?.loginId===u.loginId)
                  const totalPaid = userPurchases.reduce((a:any,b:any)=>a+(b.amount||0),0)
                  const hasPaid = userPurchases.length>0
                  return (
                    <div key={u.id} style={{background:'white', border:'1px solid #F3F4F6', borderRadius:'16px', padding:'14px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                        <div>
                          <div style={{fontWeight:800, fontSize:'13px', display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap'}}>
                            <span style={{wordBreak:'break-all'}}>{u.loginId}</span>
                            {isAdminUser(u.loginId, u.role) ? <span style={{background:'#FFD60A', fontSize:'9px', padding:'2px 6px', borderRadius:'6px', whiteSpace:'nowrap'}}>관리자</span> : null}
                            {hasPaid ? <span style={{background:'#DCFCE7', color:'#15803D', fontSize:'9px', padding:'2px 6px', borderRadius:'6px', whiteSpace:'nowrap'}}>결제</span> : <span style={{background:'#F3F4F6', fontSize:'9px', padding:'2px 6px', borderRadius:'6px', whiteSpace:'nowrap'}}>무료</span>}
                          </div>
                          <div style={{fontSize:'13px', fontWeight:600, marginTop:'2px'}}>{u.name}</div>
                          <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'2px'}}>{new Date(u.createdAt).toLocaleDateString('ko-KR')} 가입</div>
                        </div>
                        <div style={{textAlign:'right', flexShrink:0, marginLeft:'8px'}}>
                          <div style={{fontSize:'10px', color:'#6B7280'}}>ID: {u.id.slice(0,8)}...</div>
                          <button onClick={()=>resetPassword(u.loginId)} style={{marginTop:'4px', background:'#F3F4F6', border:'none', borderRadius:'8px', padding:'4px 8px', fontSize:'10px', cursor:'pointer'}}>비번변경</button>
                        </div>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', fontSize:'12px'}}>
                        <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>아이디 / 비밀번호</div>
                          <div style={{marginTop:'4px', fontSize:'11px', wordBreak:'break-all'}}>
                            <div>🆔 {u.loginId}</div>
                            <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'2px'}}>
                              🔑 {showPasswords[u.id] ? (u.password?.slice(0,25) || 'hashed') : '••••••••'}
                              <button onClick={()=>setShowPasswords({...showPasswords, [u.id]: !showPasswords[u.id]})} style={{fontSize:'10px', background:'white', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'2px 6px', cursor:'pointer', flexShrink:0}}>{showPasswords[u.id] ? '숨김' : '보기'}</button>
                            </div>
                          </div>
                        </div>
                        <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>전화번호 / 이름</div>
                          <div style={{marginTop:'4px', fontSize:'11px'}}>
                            <div>📞 {u.phone}</div>
                            <div style={{marginTop:'2px'}}>👤 {u.name}</div>
                          </div>
                        </div>
                        <div style={{background:'#FFF7CC', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color:'#92400E', fontWeight:700}}>관심 자격증</div>
                          <div style={{marginTop:'4px', fontSize:'10px', fontWeight:600}}>
                            {u.interests?.length ? u.interests.map((i:string)=><span key={i} style={{display:'inline-block', background:'white', padding:'2px 6px', borderRadius:'6px', margin:'2px', fontSize:'10px'}}>{i}</span>) : '없음'}
                          </div>
                        </div>
                        <div style={{background: hasPaid ? '#DCFCE7' : '#F3F4F6', borderRadius:'10px', padding:'10px'}}>
                          <div style={{fontSize:'10px', color: hasPaid ? '#15803D' : '#6B7280', fontWeight:700}}>결제 / 구독 현황</div>
                          <div style={{marginTop:'4px', fontSize:'11px'}}>
                            {hasPaid ? (
                              <>
                                <div style={{fontWeight:700, color:'#15803D'}}>{totalPaid.toLocaleString()}원</div>
                                <div>{userPurchases.length}건 결제</div>
                              </>
                            ) : (
                              <div style={{color:'#6B7280'}}>미결제 (무료 회원)</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredUsers.length===0 && <div style={{padding:'40px', textAlign:'center', color:'#9CA3AF'}}><div>회원이 {users.length}명 있습니다.</div><div style={{fontSize:'12px', marginTop:'4px'}}>검색어를 지우거나 새로고침을 눌러보세요.</div></div>}
              </div>

              <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
                <button onClick={()=>{
                  const headers = ['아이디','비밀번호(해시)','이름','전화번호','관심자격증','역할','가입일','결제금액','결제건수']
                  const rows = users.map((u:any)=>{
                    const ups = purchases.filter((p:any)=>p.userId===u.id || p.userId===u.loginId)
                    const total = ups.reduce((a:any,b:any)=>a+(b.amount||0),0)
                    return [`"${u.loginId}"`,`"${(u.password||'').slice(0,30)}"`,`"${u.name}"`,`"${u.phone}"`,`"${(u.interests||[]).join(',')}"`,`"${u.role}"`,`"${u.createdAt}"`,`${total}`,`${ups.length}`].join(',')
                  })
                  const csv = [headers.join(','), ...rows].join('\n')
                  const blob = new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8;'})
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a'); a.href=url; a.download=`FastPass_전체회원_${new Date().toISOString().slice(0,10)}.csv`; a.click()
                }} style={{flex:1, background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontSize:'13px', fontWeight:700, cursor:'pointer'}}>📥 전체 회원 CSV (엑셀)</button>
              </div>
            </div>
          )}

          {activeTab==='payments' && (
            <div>
              {purchases.length===0 ? <div style={{padding:'40px', textAlign:'center', color:'#6B7280'}}>결제 내역 없음</div> :
                purchases.map((p:any)=>(
                  <div key={p.id} style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', marginBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:700, fontSize:'13px'}}>{p.user?.loginId || p.userId?.slice(0,12)} - {p.amount?.toLocaleString()}원</div>
                      <div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>{p.flipbookId || '구독'} | {new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{fontSize:'16px', fontWeight:800, color:'#10B981'}}>{p.amount?.toLocaleString()}원</div>
                  </div>
                ))
              }
            </div>
          )}

          {activeTab==='stats' && (
            <div style={{display:'grid', gap:'12px'}}>
              <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'16px'}}>
                <div style={{fontSize:'13px', fontWeight:700}}>자격증별 관심도</div>
                {['전기기사','전기산업기사','전기공사기사','전기기능사','소방설비기사'].map((cert)=>{
                  const count = users.filter((u:any)=>u.interests?.some((x:string)=>x.includes(cert.replace('소방설비기사','소방')))).length
                  return <div key={cert} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', background:'white', padding:'10px 12px', borderRadius:'8px', marginTop:'8px'}}><span>{cert}</span><span style={{fontWeight:800}}>{count}명</span></div>
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px', textAlign:'center'}}>
          <div style={{fontSize:'13px', color:'#6B7280'}}>일반 회원입니다.</div>
          <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'8px'}}>관리자 아이디: parkhy5454@gmail.com / parkhy5454<br/>현재: {user.loginId}</div>
          <button onClick={async()=>{
            if(confirm(`${user.loginId}를 관리자로 승격할까요?`)){
              await fetch('/api/admin/make-admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId: user.loginId})});
              alert('승격 완료! 새로고침합니다.'); location.reload()
            }
          }} style={{marginTop:'12px', background:'#FFD60A', border:'none', padding:'10px 20px', borderRadius:'10px', fontWeight:700, cursor:'pointer'}}>🔑 내 계정을 관리자로 승격</button>
        </div>
      )}

      <button onClick={logout} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
      <div style={{textAlign:'center', fontSize:'11px', color:'#9CA3AF', padding:'12px', marginTop:'8px'}}>FastPass v3.0 | 배포자 {user.loginId} | 회원 {users.length}명 관리중</div>
    </main>
  )
}
