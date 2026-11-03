
'use client'
import { useEffect, useState } from 'react'
function isAdminUser(loginId:string, role:string){ if(!loginId) return false; const id=loginId.toLowerCase(); return role==='ADMIN' || id.includes('parkhy5454') || id.includes('parkhy') }

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([]) // 기출문제, 예상문제, 123회 예상문제 등
  const [problemFolders, setProblemFolders] = useState<any[]>([]) // 123회 등 세부 폴더
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'members'|'problems'>('problems')
  const [selectedType, setSelectedType] = useState('전체')
  const [selectedFolder, setSelectedFolder] = useState('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('기출문제')
  const [uploadFolder, setUploadFolder] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [editingType, setEditingType] = useState<any>(null)
  const [editTypeName, setEditTypeName] = useState('')

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      if(isAdminUser(d.user?.loginId, d.user?.role)) loadData()
    }).catch(()=>setLoading(false))
  },[])

  function loadData(){
    fetch('/api/admin/users').then(r=>r.json()).then(d=> setUsers(Array.isArray(d)? d : d.users || [])).catch(()=>{})
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/categories').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setCategories(d)
      else setCategories([{id:'1', name:'전기기사'}, {id:'2', name:'전기공사기사'}])
    }).catch(()=> setCategories([{id:'1', name:'전기기사'}]))
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setProblemTypes(d)
      else setProblemTypes([
        {id:'1', name:'기출문제', countLabel:'10개년', icon:'📜'},
        {id:'2', name:'예상문제', countLabel:'300제', icon:'⭐'},
      ])
    }).catch(()=> setProblemTypes([{id:'1', name:'기출문제', countLabel:'10개년', icon:'📜'}, {id:'2', name:'예상문제', countLabel:'300제', icon:'⭐'}]))
    fetch('/api/admin/problem-folders').then(r=>r.json()).then(d=>{
      if(Array.isArray(d)) setProblemFolders(d)
      else setProblemFolders([])
    }).catch(()=>{})
  }

  const filteredFlipbooks = flipbooks.filter(f=>{
    if(selectedType!=='전체' && f.type!==selectedType) return false
    if(selectedFolder!=='전체' && f.category!==selectedFolder && f.folder!==selectedFolder) return false
    return true
  })

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요</main>
  const isAdmin = isAdminUser(user.loginId, user.role)

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'20px', fontWeight:800}}>⚙️ MY / 설정</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:700, fontSize:'14px'}}>내 정보 {isAdmin && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'6px'}}>배포자</span>}</div>
        <div style={{marginTop:'8px', fontSize:'13px'}}>{user.loginId}</div>
      </div>

      {isAdmin && (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
          {/* 원래 탭 - 회원 / 문제 */}
          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            <button onClick={()=>setActiveTab('members')} style={{flex:1, padding:'10px', borderRadius:'12px', border:'none', fontWeight:700, fontSize:'13px', background: activeTab==='members'?'#111827':'#F3F4F6', color: activeTab==='members'?'white':'#6B7280'}}>👥 회원 {users.length}명</button>
            <button onClick={()=>setActiveTab('problems')} style={{flex:1, padding:'10px', borderRadius:'12px', border:'none', fontWeight:700, fontSize:'13px', background: activeTab==='problems'?'#111827':'#F3F4F6', color: activeTab==='problems'?'white':'#6B7280'}}>📚 문제 {flipbooks.length}개</button>
          </div>

          {activeTab==='problems' && (
            <div>
              {/* ★ 여기가 사용자가 말한 부분 - 기출문제, 예상문제, 123회 예상문제 등 생성/삭제 가능 */}
              <div style={{background:'#FFFBEB', borderRadius:'16px', padding:'14px', border:'1px dashed #F59E0B', marginBottom:'16px'}}>
                <div style={{fontWeight:800, fontSize:'12px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span>📂 문제 유형 관리 (생성/삭제 가능)</span>
                  <span style={{fontSize:'10px', background:'white', padding:'4px 8px', borderRadius:'8px', color:'#92400E'}}>★ 이 부분 요청하신 기능</span>
                </div>
                
                {/* 현재 문제 유형 목록 - 기출문제, 예상문제 등 */}
                <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px'}}>
                  <button onClick={()=>setSelectedType('전체')} style={{padding:'8px 14px', borderRadius:'20px', border:'none', background: selectedType==='전체'?'#111827':'white', color: selectedType==='전체'?'white':'#6B7280', fontSize:'12px', fontWeight:700, borderWidth:'1px', borderStyle:'solid', borderColor:'#E5E7EB'}}>전체 ({flipbooks.length})</button>
                  {problemTypes.map((t:any)=>{
                    const count = flipbooks.filter(f=>f.type===t.name).length
                    const isSelected = selectedType===t.name
                    return (
                      <div key={t.id} style={{display:'flex', alignItems:'center', background: isSelected ? '#FFD60A' : 'white', borderRadius:'20px', border:'1px solid #E5E7EB', padding:'0 4px 0 12px'}}>
                        <button onClick={()=>setSelectedType(t.name)} style={{background:'transparent', border:'none', fontSize:'12px', fontWeight:700, cursor:'pointer', padding:'8px 0'}}>
                          {t.icon||'📄'} {t.name} ({count}{t.countLabel? `/${t.countLabel}`:''})
                        </button>
                        <button onClick={async()=>{ if(!confirm(`${t.name} 삭제?`)) return; await fetch('/api/admin/problem-types', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:t.id})}); loadData() }} style={{background:'transparent', border:'none', marginLeft:'4px', cursor:'pointer', fontSize:'14px', padding:'4px 6px'}}>✕</button>
                      </div>
                    )
                  })}
                </div>

                {/* 새 문제 유형 생성 - 123회 예상문제 등 */}
                <div style={{display:'flex', gap:'6px'}}>
                  <input value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} placeholder="새 유형 (예: 123회 예상문제, 124회 기출)" style={{flex:1, padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB', fontSize:'12px'}} />
                  <button onClick={async()=>{ if(!newTypeName.trim()) return alert('이름 입력'); const icon=newTypeName.includes('예상')?'⭐':newTypeName.includes('기출')?'📜':'📁'; await fetch('/api/admin/problem-types', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newTypeName.trim(), icon, countLabel:''})}); setNewTypeName(''); loadData(); alert(`✅ ${newTypeName} 생성됨!`) }} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'10px 16px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>생성</button>
                </div>

                <div style={{marginTop:'10px', fontSize:'10px', color:'#92400E', background:'white', padding:'8px 10px', borderRadius:'8px'}}>
                  💡 예: "123회 예상문제" 입력 → 생성 → 기출문제, 예상문제 옆에 버튼으로 생김 → 클릭하면 해당 폴더 문제만 필터<br/>
                  삭제는 각 버튼 옆 ✕ 클릭
                </div>
              </div>

              {/* 원래 UI 복구 - 기출 / 예상 문제 PDF 관리 (스크린샷과 동일) */}
              <div style={{marginTop:'8px'}}>
                <div style={{fontWeight:800, fontSize:'14px', display:'flex', alignItems:'center', gap:'6px', marginBottom:'12px'}}>
                  📚 기출 / 예상 문제 PDF 관리
                </div>

                {/* 원래 있던 두 버튼 - 기출문제, 예상문제 (스크린샷 동일 레이아웃) */}
                <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
                  {problemTypes.slice(0,4).map((t:any)=>{
                    const count = flipbooks.filter(f=>f.type===t.name).length
                    const isSel = selectedType===t.name || (uploadType===t.name)
                    return (
                      <button key={t.id} onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, fontSize:'13px', background: isSel ? '#FFD60A' : '#F3F4F6', color: isSel ? '#111827' : '#6B7280', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
                        {t.icon} {t.name} ({count}개{count>0?`년`:` `}{t.countLabel? `/ ${t.countLabel}`:''})
                      </button>
                    )
                  })}
                  {problemTypes.length===0 && (
                    <>
                      <button onClick={()=>{setSelectedType('기출문제'); setUploadType('기출문제')}} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, fontSize:'13px', background: selectedType==='기출문제'?'#FFD60A':'#F3F4F6'}}>📜 기출문제 ({flipbooks.filter(f=>f.type==='기출문제').length}개년)</button>
                      <button onClick={()=>{setSelectedType('예상문제'); setUploadType('예상문제')}} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, fontSize:'13px', background: selectedType==='예상문제'?'#FFD60A':'#F3F4F6'}}>⭐ 예상문제 ({flipbooks.filter(f=>f.type==='예상문제').length}제)</button>
                    </>
                  )}
                </div>

                {/* 자격증 분류 필터 (원래 UI) */}
                <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px'}}>
                  <button onClick={()=>setSelectedFolder('전체')} style={{padding:'6px 12px', borderRadius:'16px', border:'1px solid #E5E7EB', background: selectedFolder==='전체'?'#111827':'white', color: selectedFolder==='전체'?'white':'#6B7280', fontSize:'11px'}}>전체</button>
                  {categories.map((c:any)=>{ const cnt=flipbooks.filter(f=>f.category===c.name).length; return <button key={c.id} onClick={()=>setSelectedFolder(c.name)} style={{padding:'6px 12px', borderRadius:'16px', border:'1px solid #E5E7EB', background: selectedFolder===c.name?'#FFD60A':'white', fontSize:'11px', fontWeight:600}}>{c.name} ({cnt})</button> })}
                </div>

                {/* 원래 업로드 폼 - 스크린샷과 동일 */}
                <form onSubmit={async(e)=>{ e.preventDefault(); const fileInput=document.getElementById('pdfFile') as HTMLInputElement; const file=fileInput?.files?.[0]; if(!file || !uploadTitle.trim()){ alert('제목과 파일 필요'); return } setUploading(true); try{ const fd=new FormData(); fd.append('file', file); fd.append('title', uploadTitle); fd.append('category', uploadCategory); fd.append('type', uploadType); if(uploadFolder) fd.append('folder', uploadFolder); const res=await fetch('/api/admin/upload-pdf', {method:'POST', body:fd}); const data=await res.json(); if(res.ok){ alert(`업로드 완료! (${uploadType} - ${uploadFolder||uploadCategory})`); setUploadTitle(''); setUploadFolder(''); if(fileInput) fileInput.value=''; loadData() } else alert(data.error) } finally{ setUploading(false) } }} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', display:'grid', gap:'12px', border:'1px solid #F3F4F6'}}>
                  <div style={{fontWeight:700, fontSize:'13px'}}>{uploadType} PDF 업로드</div>
                  
                  <div>
                    <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>자격증 분류</div>
                    <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', background:'white'}}>
                      {categories.map((c:any)=><option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  {problemFolders.length>0 && (
                    <div>
                      <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>세부 폴더 (예: 123회, 124회)</div>
                      <select value={uploadFolder} onChange={e=>setUploadFolder(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', background:'white'}}>
                        <option value="">폴더 선택 안함</option>
                        {problemFolders.map((f:any)=><option key={f.id} value={f.name}>{f.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>제목</div>
                    <input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="예: 2023년 전기기사 1회 기출" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
                  </div>

                  <div>
                    <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>PDF 파일</div>
                    <div style={{display:'flex', gap:'8px', alignItems:'center', background:'white', padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB'}}>
                      <label htmlFor="pdfFile" style={{background:'#F3F4F6', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', border:'1px solid #E5E7EB'}}>파일 선택</label>
                      <input id="pdfFile" type="file" accept=".pdf" style={{display:'none'}} onChange={e=>{ const n=e.target.files?.[0]?.name; if(n){ const el=document.getElementById('fileName'); if(el) el.textContent=n } }} />
                      <span id="fileName" style={{fontSize:'12px', color:'#6B7280'}}>선택된 파일 없음</span>
                    </div>
                  </div>

                  <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800, cursor:'pointer'}}>{uploading ? '업로드중...' : `📤 ${uploadType} 업로드`}</button>
                </form>

                {/* 목록 */}
                <div style={{marginTop:'16px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                    <div style={{fontWeight:700, fontSize:'13px'}}>{selectedType} 목록 - {filteredFlipbooks.length}개</div>
                    <button onClick={loadData} style={{background:'#F3F4F6', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'11px'}}>새로고침</button>
                  </div>
                  {filteredFlipbooks.map((f:any)=>(
                    <div key={f.id} style={{background:'#F8F9FB', borderRadius:'10px', padding:'12px', marginBottom:'8px', display:'flex', justifyContent:'space-between'}}>
                      <div><div style={{fontWeight:700, fontSize:'12px'}}>{f.title}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{f.category} / {f.type} {f.folder?`/ ${f.folder}`:''}</div><a href={`/flipbook/${f.id}`} style={{fontSize:'11px', color:'#3B82F6'}}>📖 플립북 보기 (말림+소리+다운)</a></div>
                      <button onClick={async()=>{ if(!confirm('삭제?')) return; await fetch('/api/admin/delete-flipbook', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:f.id})}); loadData() }} style={{background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', padding:'6px 10px', fontSize:'11px'}}>삭제</button>
                    </div>
                  ))}
                  {filteredFlipbooks.length===0 && <div style={{padding:'20px', textAlign:'center', color:'#9CA3AF', fontSize:'12px'}}>문제가 없습니다. PDF를 업로드하세요.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={async()=>{ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700}}>로그아웃</button>
    </main>
  )
}
