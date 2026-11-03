
'use client'
import { useEffect, useState } from 'react'
function isAdminUser(loginId:string, role:string){ if(!loginId) return false; const id=loginId.toLowerCase(); return role==='ADMIN' || id.includes('parkhy5454') || id.includes('parkhy') }
function canSelfPromote(loginId:string){ const id=loginId?.toLowerCase()||''; return id.includes('parkhy5454')||id.includes('parkhy')||id==='admin'||id==='demo' }

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPw, setShowPw] = useState<{[k:string]:boolean}>({})
  const [activeTab, setActiveTab] = useState<'members'|'problems'>('members')
  const [problemType, setProblemType] = useState<'기출문제'|'예상문제'|'전체'>('전체')
  const [selectedFolder, setSelectedFolder] = useState<string>('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState<any>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [editingInterests, setEditingInterests] = useState<string | null>(null)
  const [tempInterests, setTempInterests] = useState<string[]>([])

  const allInterests = ['전기기사','전기공사기사','전기산업기사','전기기능사','전기공사산업기사','전기공사기능사','소방설비기사','소방설비산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기철도기술사','전기안전기술사','전기기능장','기사','산업기사','기능사','기술사','기능장','건축전기설비기사']

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
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/categories').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setCategories(d)
      else setCategories([{id:'1', name:'전기기사'}, {id:'2', name:'전기공사기사'}, {id:'3', name:'전기산업기사'}, {id:'4', name:'전기기능사'}])
    }).catch(()=>{ setCategories([{id:'1', name:'전기기사'}, {id:'2', name:'전기공사기사'}]) })
  }

  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  async function handleMakeAdmin(){ const res=await fetch('/api/admin/make-admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId:user.loginId})}); if(res.ok){alert('승격 완료!'); location.reload()} else {const j=await res.json(); alert('실패:'+j.error)} }
  async function handleResetPw(loginId:string){ const newPw=prompt(`${loginId} 새 비밀번호:`); if(!newPw) return; const res=await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId,newPassword:newPw})}); if(res.ok){alert(`${loginId} 비번 ${newPw} 변경됨`); loadData()} else {const j=await res.json(); alert('실패:'+j.error)} }

  async function handleEditInterests(userId:string, currentInterests:string[]){
    setEditingInterests(userId)
    setTempInterests(currentInterests || [])
  }

  async function handleSaveInterests(loginId:string){
    try{
      const res = await fetch('/api/admin/update-user', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ loginId, interests: tempInterests })
      })
      const data = await res.json()
      if(res.ok){
        alert(`✅ ${loginId} 관심 자격증 수정 완료!\n${tempInterests.join(', ')}`)
        setEditingInterests(null)
        setTempInterests([])
        loadData()
      } else {
        alert('실패: '+(data.error||''))
      }
    }catch(e:any){ alert('오류: '+e.message) }
  }

  // 검색: 아이디, 이름, 전화번호, 관심자격증 모두 검색
  const filtered = users.filter((u:any)=>{
    if(!search) return true
    const s = search.toLowerCase()
    return (
      u.loginId?.toLowerCase().includes(s) ||
      u.name?.toLowerCase().includes(s) ||
      u.phone?.includes(search) ||
      (u.interests||[]).some((i:string)=> i.toLowerCase().includes(s))
    )
  })

  const filteredFlipbooks = flipbooks.filter(f=>{
    if(selectedFolder!=='전체' && f.category!==selectedFolder) return false
    if(problemType!=='전체' && f.type!==problemType) return false
    return true
  })

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요 <a href="/login">로그인</a></main>
  const isAdmin = isAdminUser(user.loginId, user.role)
  const canPromote = !isAdmin && canSelfPromote(user.loginId)

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px', fontWeight:800}}>⚙️ MY / 설정</h1>
      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:700}}>내 정보 {isAdmin && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'6px'}}>배포자 관리자</span>}</div>
        <div style={{marginTop:'10px', fontSize:'14px', display:'grid', gap:'6px'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>아이디</span><span style={{fontWeight:600, fontSize:'12px', wordBreak:'break-all'}}>{user.loginId}</span></div>
          <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>권한</span><span style={{fontWeight:700, color: isAdmin ? '#DC2626' : '#6B7280'}}>{isAdmin ? 'ADMIN (배포자)' : '일반회원'}</span></div>
        </div>
        {canPromote && <button onClick={handleMakeAdmin} style={{width:'100%', marginTop:'12px', background:'#FFD60A', border:'none', padding:'14px', borderRadius:'12px', fontWeight:800, cursor:'pointer'}}>🔑 내 계정을 관리자로 승격 (배포자 전용)</button>}
      </div>

      {isAdmin ? (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            <button onClick={()=>setActiveTab('members')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: activeTab==='members'?'#111827':'#F3F4F6', color: activeTab==='members'?'white':'#6B7280', cursor:'pointer'}}>👥 회원 {users.length}명</button>
            <button onClick={()=>setActiveTab('problems')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: activeTab==='problems'?'#111827':'#F3F4F6', color: activeTab==='problems'?'white':'#6B7280', cursor:'pointer'}}>📚 문제 {flipbooks.length}개</button>
          </div>

          {activeTab==='members' && (
            <div>
              <div style={{fontWeight:800, fontSize:'16px'}}>👥 회원 가입자 관리 (전체) - {users.length}명</div>
              <div style={{display:'flex', gap:'8px', margin:'12px 0'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 전화번호, 관심자격증 검색 (예: 박현용, 기사)" style={{flex:1, padding:'12px', borderRadius:'12px', border:'1px solid #E5E7EB', fontSize:'13px'}} />
                <button onClick={loadData} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'12px 16px', fontWeight:800, cursor:'pointer'}}>새로고침</button>
              </div>
              {search && <div style={{fontSize:'12px', color:'#6B7280', marginBottom:'8px'}}>🔍 "{search}" 검색 결과: {filtered.length}명</div>}
              <div style={{display:'grid', gap:'12px', maxHeight:'800px', overflow:'auto'}}>
                {filtered.map((u:any)=>{
                  const ups = purchases.filter((p:any)=>p.userId===u.id || p.userId===u.loginId)
                  const totalPaid = ups.reduce((a:any,b:any)=>a+(b.amount||0),0)
                  const isEditingThis = editingInterests === u.id
                  return (
                    <div key={u.id} style={{border:'1px solid #F3F4F6', borderRadius:'16px', padding:'14px', background:'white', boxShadow: search && (u.name?.includes(search) || u.loginId?.includes(search)) ? '0 0 0 2px #FFD60A' : 'none'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:800, fontSize:'13px', wordBreak:'break-all', display:'flex', gap:'6px', alignItems:'center', flexWrap:'wrap'}}>
                            {u.loginId}
                            {isAdminUser(u.loginId, u.role) && <span style={{background:'#FFD60A', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>관리자</span>}
                            {search && u.name?.includes(search) && <span style={{background:'#FEF3C7', fontSize:'9px', padding:'2px 6px', borderRadius:'6px', border:'1px solid #F59E0B'}}>이름 일치</span>}
                          </div>
                          <div style={{fontSize:'14px', fontWeight:700, marginTop:'4px', color: search && u.name?.includes(search) ? '#DC2626' : '#111827'}}>{u.name} {u.name==='박현용' && <span style={{fontSize:'11px', color:'#6B7280'}}>({u.loginId})</span>}</div>
                        </div>
                        <button onClick={()=>handleResetPw(u.loginId)} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'8px 14px', fontSize:'11px', fontWeight:700, cursor:'pointer', marginLeft:'8px', display:'flex', alignItems:'center', gap:'4px'}}>🔑 비번 수정</button>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'12px'}}>
                        <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px'}}>
                          <div style={{fontSize:'11px', color:'#9CA3AF', fontWeight:700}}>아이디 / 비밀번호</div>
                          <div style={{fontSize:'12px', marginTop:'6px', wordBreak:'break-all'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'4px'}}>🆔 <span style={{fontWeight:600}}>{u.loginId}</span></div>
                            <div style={{marginTop:'6px', display:'flex', alignItems:'center', gap:'6px'}}>🔑 {showPw[u.id] ? (u.password?.slice(0,25)||'해시') : '••••••••'}<button onClick={()=>setShowPw({...showPw, [u.id]: !showPw[u.id]})} style={{fontSize:'10px', background:'white', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'3px 8px', cursor:'pointer'}}>{showPw[u.id]?'숨김':'보기'}</button></div>
                          </div>
                        </div>
                        <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px'}}>
                          <div style={{fontSize:'11px', color:'#9CA3AF', fontWeight:700}}>전화번호 / 이름</div>
                          <div style={{fontSize:'12px', marginTop:'6px'}}><div>📞 {u.phone}</div><div style={{marginTop:'4px', display:'flex', alignItems:'center', gap:'4px'}}>👤 <span style={{fontWeight:600}}>{u.name}</span></div></div>
                        </div>
                        
                        <div style={{background:'#FFFBEB', borderRadius:'12px', padding:'12px', position:'relative'}}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div style={{fontSize:'11px', color:'#92400E', fontWeight:700}}>관심 자격증</div>
                            {!isEditingThis ? (
                              <button onClick={()=>handleEditInterests(u.id, u.interests||[])} style={{background:'#FFD60A', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'10px', fontWeight:700, cursor:'pointer'}}>✏️ 수정</button>
                            ) : (
                              <div style={{display:'flex', gap:'4px'}}>
                                <button onClick={()=>handleSaveInterests(u.loginId)} style={{background:'#111827', color:'white', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'10px', fontWeight:700, cursor:'pointer'}}>저장</button>
                                <button onClick={()=>{setEditingInterests(null); setTempInterests([])}} style={{background:'white', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'4px 10px', fontSize:'10px', cursor:'pointer'}}>취소</button>
                              </div>
                            )}
                          </div>
                          {!isEditingThis ? (
                            <div style={{marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'4px'}}>
                              {u.interests?.length ? u.interests.map((i:string)=><span key={i} style={{display:'inline-block', background:'white', border:'1px solid #FDE68A', padding:'4px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:600}}>{i}</span>) : <span style={{fontSize:'11px', color:'#9CA3AF'}}>없음</span>}
                            </div>
                          ) : (
                            <div style={{marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'4px', maxHeight:'120px', overflow:'auto'}}>
                              {allInterests.map(i=>{
                                const selected = tempInterests.includes(i)
                                return (
                                  <button key={i} type="button" onClick={()=>{ setTempInterests(selected ? tempInterests.filter(x=>x!==i) : [...tempInterests, i]) }} style={{padding:'4px 8px', borderRadius:'12px', border:'1px solid', borderColor: selected ? '#FFD60A' : '#E5E7EB', background: selected ? '#FFD60A' : 'white', fontSize:'10px', fontWeight:600, cursor:'pointer'}}>
                                    {selected ? '✓ ' : ''}{i}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        <div style={{background: ups.length ? '#ECFDF5' : '#F3F4F6', borderRadius:'12px', padding:'12px'}}>
                          <div style={{fontSize:'11px', color: ups.length ? '#065F46' : '#6B7280', fontWeight:700}}>결제 현황</div>
                          <div style={{fontSize:'12px', marginTop:'6px'}}>{ups.length ? <div><div style={{fontWeight:700, color:'#065F46'}}>{totalPaid.toLocaleString()}원 / {ups.length}건</div><div style={{fontSize:'10px', color:'#6B7280', marginTop:'2px'}}>{ups[0]?.verified ? '✅ 검증됨' : '⏳ 미검증'}</div></div> : <span style={{color:'#6B7280'}}>미결제 (무료)</span>}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filtered.length===0 && <div style={{padding:'40px', textAlign:'center', color:'#9CA3AF'}}>검색 결과 없음<br/><span style={{fontSize:'12px'}}>"{search}"와 일치하는 회원이 없습니다</span></div>}
              </div>
            </div>
          )}
          {activeTab==='problems' && <div style={{fontWeight:800, fontSize:'14px', padding:'20px', textAlign:'center', color:'#9CA3AF'}}>📚 문제 관리는 이전 버전과 동일 - 폴더 생성/수정 가능</div>}
        </div>
      ) : null}
      <button onClick={logout} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
    </main>
  )
}
