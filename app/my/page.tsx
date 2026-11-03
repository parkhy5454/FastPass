
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
      else setCategories([
        {id:'1', name:'전기기사', count:0},
        {id:'2', name:'전기공사기사', count:0},
        {id:'3', name:'전기산업기사', count:0},
        {id:'4', name:'전기기능사', count:0},
        {id:'5', name:'소방설비기사', count:0},
        {id:'6', name:'기술사', count:0},
        {id:'7', name:'기능장', count:0},
      ])
    }).catch(()=>{
      setCategories([
        {id:'1', name:'전기기사', count:0},
        {id:'2', name:'전기공사기사', count:0},
        {id:'3', name:'전기산업기사', count:0},
        {id:'4', name:'전기기능사', count:0},
      ])
    })
  }

  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  async function handleMakeAdmin(){ const res=await fetch('/api/admin/make-admin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId:user.loginId})}); if(res.ok){alert('승격 완료!'); location.reload()} else {const j=await res.json(); alert('실패:'+j.error)} }
  async function handleResetPw(loginId:string){ const newPw=prompt(`${loginId} 새 비밀번호:`); if(!newPw) return; const res=await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({loginId,newPassword:newPw})}); if(res.ok){alert(`${loginId} 비번 ${newPw} 변경됨`); loadData()} else {const j=await res.json(); alert('실패:'+j.error)} }

  async function handleCreateFolder(){
    if(!newFolderName.trim()){ alert('폴더 이름을 입력하세요'); return }
    if(categories.some(c=>c.name===newFolderName.trim())){ alert('이미 존재하는 폴더입니다'); return }
    try{
      const res = await fetch('/api/admin/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: newFolderName.trim() }) })
      const data = await res.json()
      if(res.ok){ alert(`📁 폴더 "${newFolderName}" 생성 완료!`); setNewFolderName(''); loadData() }
      else { // fallback local
        const newCat = { id: Date.now().toString(), name: newFolderName.trim(), count:0 }
        setCategories([...categories, newCat]); setNewFolderName(''); alert(`📁 폴더 "${newFolderName}" 생성 완료! (로컬)`)
      }
    }catch{ const newCat={id:Date.now().toString(), name:newFolderName.trim(), count:0}; setCategories([...categories, newCat]); setNewFolderName(''); }
  }

  async function handleEditFolder(){
    if(!editingFolder || !editFolderName.trim()) return
    const oldName = editingFolder.name
    const newName = editFolderName.trim()
    try{
      const res = await fetch('/api/admin/categories', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: editingFolder.id, name: newName, oldName }) })
      if(res.ok){ alert(`📁 "${oldName}" → "${newName}" 수정 완료!`); setEditingFolder(null); setEditFolderName(''); loadData() }
      else { setCategories(categories.map(c=> c.id===editingFolder.id ? {...c, name:newName} : c)); setEditingFolder(null); setEditFolderName(''); }
    }catch{ setCategories(categories.map(c=> c.id===editingFolder.id ? {...c, name:newName} : c)); setEditingFolder(null); setEditFolderName(''); }
  }

  async function handleDeleteFolder(cat:any){
    if(!confirm(`📁 "${cat.name}" 폴더를 삭제할까요?\n폴더 안의 문제들은 그대로 남지만 분류가 "기타"로 바뀝니다.`)) return
    try{
      const res = await fetch('/api/admin/categories/delete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: cat.id, name: cat.name }) })
      if(res.ok){ alert('삭제 완료'); loadData(); if(selectedFolder===cat.name) setSelectedFolder('전체') }
      else { setCategories(categories.filter(c=>c.id!==cat.id)); if(selectedFolder===cat.name) setSelectedFolder('전체') }
    }catch{ setCategories(categories.filter(c=>c.id!==cat.id)); if(selectedFolder===cat.name) setSelectedFolder('전체') }
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
      formData.append('file', file); formData.append('title', uploadTitle); formData.append('category', uploadCategory); formData.append('type', problemType==='전체' ? '기출문제' : problemType)
      const res = await fetch('/api/admin/upload-pdf', { method:'POST', body: formData })
      const data = await res.json()
      if(res.ok){ alert(`✅ 업로드 완료! ${uploadCategory} - ${uploadTitle}`); setUploadTitle(''); if(fileInput) fileInput.value=''; loadData() }
      else alert('실패: '+(data.error||''))
    }catch(err:any){ alert('오류: '+err.message) } finally { setUploading(false) }
  }

  async function handleDeleteFlipbook(id:string){ if(!confirm('삭제할까요?')) return; const res=await fetch('/api/admin/delete-flipbook', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})}); if(res.ok){alert('삭제 완료'); loadData()} else {const j=await res.json(); alert('실패:'+j.error)} }

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요 <a href="/login">로그인</a></main>
  const isAdmin = isAdminUser(user.loginId, user.role)
  const canPromote = !isAdmin && canSelfPromote(user.loginId)
  const filtered = users.filter((u:any)=> !search || u.loginId?.toLowerCase().includes(search.toLowerCase()) || u.name?.includes(search))
  const filteredFlipbooks = flipbooks.filter(f=>{
    if(selectedFolder!=='전체' && f.category!==selectedFolder) return false
    if(problemType!=='전체' && f.type!==problemType) return false
    return true
  })

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
              <div style={{fontWeight:800, fontSize:'16px'}}>📚 문제 폴더 관리</div>
              <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>폴더를 직접 만들고 수정할 수 있습니다</div>

              {/* 폴더 생성 */}
              <div style={{background:'#FFFBEB', borderRadius:'16px', padding:'16px', marginTop:'16px', display:'grid', gap:'10px'}}>
                <div style={{fontWeight:700, fontSize:'13px'}}>➕ 새 폴더 만들기</div>
                <div style={{display:'flex', gap:'8px'}}>
                  <input value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} placeholder="예: 소방설비기사, 전기철도기사, 나만의 기출" style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
                  <button onClick={handleCreateFolder} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'12px 20px', fontWeight:700, cursor:'pointer'}}>생성</button>
                </div>
              </div>

              {/* 폴더 목록 */}
              <div style={{marginTop:'16px'}}>
                <div style={{fontWeight:700, fontSize:'13px', marginBottom:'8px'}}>📁 폴더 목록 - {categories.length}개 (클릭하면 해당 폴더 문제만 보기)</div>
                <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                  <button onClick={()=>setSelectedFolder('전체')} style={{padding:'10px 16px', borderRadius:'20px', border:'1px solid', borderColor: selectedFolder==='전체' ? '#111827' : '#E5E7EB', background: selectedFolder==='전체' ? '#111827' : 'white', color: selectedFolder==='전체' ? 'white' : '#6B7280', fontWeight:700, fontSize:'12px', cursor:'pointer'}}>
                    📂 전체 ({flipbooks.length})
                  </button>
                  {categories.map((cat:any)=>{
                    const count = flipbooks.filter(f=>f.category===cat.name).length
                    return (
                      <div key={cat.id} style={{display:'flex', alignItems:'center', gap:'4px', background: selectedFolder===cat.name ? '#FFD60A' : 'white', border:'1px solid', borderColor: selectedFolder===cat.name ? '#FFD60A' : '#E5E7EB', borderRadius:'20px', padding:'4px 4px 4px 12px'}}>
                        <button onClick={()=>setSelectedFolder(cat.name)} style={{background:'none', border:'none', fontWeight:700, fontSize:'12px', cursor:'pointer'}}>
                          📁 {cat.name} ({count})
                        </button>
                        <button onClick={()=>{setEditingFolder(cat); setEditFolderName(cat.name)}} style={{background:'white', border:'1px solid #E5E7EB', borderRadius:'50%', width:'24px', height:'24px', fontSize:'10px', cursor:'pointer'}}>✏️</button>
                        <button onClick={()=>handleDeleteFolder(cat)} style={{background:'#FEE2E2', border:'none', borderRadius:'50%', width:'24px', height:'24px', fontSize:'10px', cursor:'pointer'}}>🗑️</button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {editingFolder && (
                <div style={{background:'#E0F2FE', borderRadius:'12px', padding:'12px', marginTop:'12px', display:'flex', gap:'8px', alignItems:'center'}}>
                  <span style={{fontSize:'12px', fontWeight:700}}>"{editingFolder.name}" 수정:</span>
                  <input value={editFolderName} onChange={e=>setEditFolderName(e.target.value)} style={{flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #93C5FD'}} />
                  <button onClick={handleEditFolder} style={{background:'#111827', color:'white', border:'none', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', cursor:'pointer'}}>저장</button>
                  <button onClick={()=>setEditingFolder(null)} style={{background:'white', border:'1px solid #E5E7EB', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', cursor:'pointer'}}>취소</button>
                </div>
              )}

              {/* 타입 필터 */}
              <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
                <button onClick={()=>setProblemType('전체')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', fontWeight:700, background: problemType==='전체'?'#111827':'#F3F4F6', color: problemType==='전체'?'white':'#6B7280', cursor:'pointer', fontSize:'12px'}}>전체</button>
                <button onClick={()=>setProblemType('기출문제')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', fontWeight:700, background: problemType==='기출문제'?'#111827':'#F3F4F6', color: problemType==='기출문제'?'white':'#6B7280', cursor:'pointer', fontSize:'12px'}}>📜 기출</button>
                <button onClick={()=>setProblemType('예상문제')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', fontWeight:700, background: problemType==='예상문제'?'#FFD60A':'#F3F4F6', color: problemType==='예상문제'?'#111827':'#6B7280', cursor:'pointer', fontSize:'12px'}}>⭐ 예상</button>
              </div>

              {/* 업로드 폼 */}
              <form onSubmit={handleUpload} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', marginTop:'16px', display:'grid', gap:'12px'}}>
                <div style={{fontWeight:700, fontSize:'14px'}}>📤 {selectedFolder!=='전체' ? selectedFolder : '문제'} PDF 업로드 {problemType!=='전체' ? `- ${problemType}` : ''}</div>
                <div>
                  <label style={{fontSize:'12px', fontWeight:700}}>폴더 선택</label>
                  <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', marginTop:'6px'}}>
                    {categories.map((c:any)=><option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div><label style={{fontSize:'12px', fontWeight:700}}>제목</label><input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="예: 2023년 전기기사 1회 기출" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', marginTop:'6px', boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:'12px', fontWeight:700}}>PDF 파일</label><input id="pdfFile" type="file" accept=".pdf" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', marginTop:'6px', background:'white'}} /></div>
                <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800, cursor:'pointer'}}>{uploading ? '업로드중...' : `📤 업로드 (${uploadCategory})`}</button>
              </form>

              {/* 문제 목록 */}
              <div style={{marginTop:'20px'}}>
                <div style={{fontWeight:700, fontSize:'14px', display:'flex', justifyContent:'space-between'}}><span>{selectedFolder!=='전체' ? selectedFolder : '전체'} {problemType!=='전체' ? problemType : ''} - {filteredFlipbooks.length}개</span><button onClick={loadData} style={{background:'#F3F4F6', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'11px', cursor:'pointer'}}>새로고침</button></div>
                <div style={{display:'grid', gap:'8px', marginTop:'12px', maxHeight:'500px', overflow:'auto'}}>
                  {filteredFlipbooks.length===0 ? <div style={{padding:'20px', textAlign:'center', color:'#9CA3AF', fontSize:'12px'}}>해당 폴더에 문제가 없습니다.<br/>위에서 PDF를 업로드해보세요.</div> :
                    filteredFlipbooks.map((f:any)=>(
                      <div key={f.id} style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div style={{flex:1}}><div style={{fontWeight:700, fontSize:'12px'}}>{f.title}</div><div style={{fontSize:'11px', color:'#6B7280', marginTop:'2px'}}>📁 {f.category} / {f.type || '기출문제'} / {new Date(f.createdAt).toLocaleDateString()}</div></div>
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
