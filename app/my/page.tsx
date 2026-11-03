
'use client'
import { useEffect, useState } from 'react'
function isAdminUser(loginId:string, role:string){
  if(!loginId) return false
  const id = loginId.toLowerCase()
  return role==='ADMIN' || id.includes('parkhy5454') || id.includes('parkhy')
}
function canSelfPromote(loginId:string){
  const id = loginId?.toLowerCase() || ''
  return id.includes('parkhy5454') || id.includes('parkhy') || id==='admin' || id==='demo'
}
export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPw, setShowPw] = useState<{[k:string]:boolean}>({})
  const [activeTab, setActiveTab] = useState<'members'|'problems'>('members')
  const [problemType, setProblemType] = useState<'기출문제'|'예상문제'>('기출문제')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const categories = ['전기기사','전기공사기사','전기산업기사','전기기능사','전기공사산업기사','전기공사기능사','소방설비기사','기술사','기능장']
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
  }
  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  async function handleMakeAdmin(){
    const res = await fetch('/api/admin/make-admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId: user.loginId})})
    if(res.ok){ alert('관리자로 승격 완료!'); location.reload() } else { const j=await res.json(); alert('실패:'+j.error) }
  }
  async function handleResetPw(loginId:string){
    const newPw = prompt(`${loginId} 새 비밀번호:`)
    if(!newPw) return
    const res = await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId, newPassword:newPw})})
    if(res.ok){ alert(`${loginId} 비번 ${newPw} 변경됨`); loadData() } else { const j=await res.json(); alert('실패:'+j.error) }
  }
  async function handleUpload(e: React.FormEvent){
    e.preventDefault()
    if(!uploadTitle.trim()){ alert('제목을 입력하세요'); return }
    const fileInput = document.getElementById('pdfFile') as HTMLInputElement
    const file = fileInput?.files?.[0]
    if(!file){ alert('PDF 파일을 선택하세요'); return }
    setUploading(true)
    try{
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', uploadTitle)
      formData.append('category', uploadCategory)
      formData.append('type', problemType)
      const res = await fetch('/api/admin/upload-pdf', { method:'POST', body: formData })
      const data = await res.json()
      if(res.ok){ alert(`업로드 완료! ${problemType} - ${uploadCategory} ${uploadTitle}`); setUploadTitle(''); if(fileInput) fileInput.value=''; loadData() }
      else alert('실패: '+(data.error || ''))
    }catch(err:any){ alert('오류: '+err.message) } finally { setUploading(false) }
  }
  async function handleDeleteFlipbook(id:string){
    if(!confirm('삭제할까요?')) return
    const res = await fetch('/api/admin/delete-flipbook', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) })
    if(res.ok){ alert('삭제 완료'); loadData() } else { const j=await res.json(); alert('실패:'+j.error) }
  }
  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요 <a href="/login">로그인</a></main>
  const isAdmin = isAdminUser(user.loginId, user.role)
  const canPromote = !isAdmin && canSelfPromote(user.loginId)
  const filtered = users.filter((u:any)=> !search || u.loginId?.toLowerCase().includes(search.toLowerCase()) || u.name?.includes(search))
  const filteredFlipbooks = flipbooks.filter(f=> problemType==='기출문제' ? f.type==='기출문제' || !f.type : f.type===problemType)
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
                        <div style={{flex:1}}><div style={{fontWeight:800, fontSize:'12px', wordBreak:'break-all'}}>{u.loginId} {isAdminUser(u.loginId, u.role) && <span style={{background:'#FFD60A', fontSize:'9px', padding:'2px 6px', borderRadius:'6px'}}>관리자</span>}</div><div style={{fontSize:'13px', fontWeight:600, marginTop:'2px'}}>{u.name}</div></div>
                        <button onClick={()=>handleResetPw(u.loginId)} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'8px 14px', fontSize:'11px', fontWeight:700, cursor:'pointer', marginLeft:'8px'}}>🔑 비번 수정</button>
                      </div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginTop:'10px'}}>
                        <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}><div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>아이디 / 비밀번호</div><div style={{fontSize:'11px', marginTop:'4px', wordBreak:'break-all'}}>🆔 {u.loginId}<div style={{marginTop:'4px', display:'flex', gap:'4px'}}>🔑 {showPw[u.id] ? (u.password?.slice(0,20)||'해시') : '••••••••'}<button onClick={()=>setShowPw({...showPw, [u.id]: !showPw[u.id]})} style={{fontSize:'10px', background:'white', border:'1px solid #E5E7EB', borderRadius:'6px', padding:'2px 6px', cursor:'pointer'}}>{showPw[u.id]?'숨김':'보기'}</button></div></div></div>
                        <div style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px'}}><div style={{fontSize:'10px', color:'#9CA3AF', fontWeight:700}}>전화번호 / 이름</div><div style={{fontSize:'11px', marginTop:'4px'}}><div>📞 {u.phone}</div><div>👤 {u.name}</div></div></div>
                        <div style={{background:'#FFF7CC', borderRadius:'10px', padding:'10px'}}><div style={{fontSize:'10px', color:'#92400E', fontWeight:700}}>관심 자격증</div><div style={{marginTop:'4px', fontSize:'10px'}}>{u.interests?.length ? u.interests.map((i:string)=><span key={i} style={{display:'inline-block', background:'white', padding:'2px 6px', borderRadius:'6px', margin:'2px'}}>{i}</span>) : '없음'}</div></div>
                        <div style={{background: ups.length ? '#DCFCE7' : '#F3F4F6', borderRadius:'10px', padding:'10px'}}><div style={{fontSize:'10px', color: ups.length ? '#15803D' : '#6B7280', fontWeight:700}}>결제 현황</div><div style={{fontSize:'11px', marginTop:'4px'}}>{ups.length ? `${totalPaid.toLocaleString()}원 / ${ups.length}건` : '미결제'}</div></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {activeTab==='problems' && (
            <div>
              <div style={{fontWeight:800, fontSize:'16px'}}>📚 기출 / 예상 문제 PDF 관리</div>
              <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
                <button onClick={()=>setProblemType('기출문제')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: problemType==='기출문제'?'#111827':'#F3F4F6', color: problemType==='기출문제'?'white':'#6B7280', cursor:'pointer'}}>📜 기출문제 (10개년)</button>
                <button onClick={()=>setProblemType('예상문제')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: problemType==='예상문제'?'#FFD60A':'#F3F4F6', color: problemType==='예상문제'?'#111827':'#6B7280', cursor:'pointer'}}>⭐ 예상문제 (300제)</button>
              </div>
              <form onSubmit={handleUpload} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', marginTop:'16px', display:'grid', gap:'12px'}}>
                <div style={{fontWeight:700, fontSize:'14px'}}>{problemType} PDF 업로드</div>
                <div><label style={{fontSize:'12px', fontWeight:700}}>자격증 분류</label><select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', marginTop:'6px'}}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={{fontSize:'12px', fontWeight:700}}>제목</label><input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="예: 2023년 전기기사 1회 기출" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', marginTop:'6px', boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:'12px', fontWeight:700}}>PDF 파일</label><input id="pdfFile" type="file" accept=".pdf" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', marginTop:'6px', background:'white'}} /></div>
                <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800, cursor:'pointer'}}>{uploading ? '업로드중...' : `📤 ${problemType} 업로드`}</button>
              </form>
              <div style={{marginTop:'20px'}}>
                <div style={{fontWeight:700, fontSize:'14px', display:'flex', justifyContent:'space-between'}}><span>{problemType} 목록 - {filteredFlipbooks.length}개</span><button onClick={loadData} style={{background:'#F3F4F6', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'11px', cursor:'pointer'}}>새로고침</button></div>
                <div style={{display:'grid', gap:'8px', marginTop:'12px', maxHeight:'500px', overflow:'auto'}}>
                  {filteredFlipbooks.length===0 ? <div style={{padding:'20px', textAlign:'center', color:'#9CA3AF', fontSize:'12px'}}>아직 업로드된 {problemType}가 없습니다.</div> :
                    filteredFlipbooks.map((f:any)=>(
                      <div key={f.id} style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div style={{flex:1}}><div style={{fontWeight:700, fontSize:'12px'}}>{f.title}</div><div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>{f.category} / {f.type || '기출문제'} / {new Date(f.createdAt).toLocaleDateString()}</div></div>
                        <button onClick={()=>handleDeleteFlipbook(f.id)} style={{background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', fontWeight:700, cursor:'pointer', marginLeft:'8px'}}>삭제</button>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
      <button onClick={logout} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
    </main>
  )
}
