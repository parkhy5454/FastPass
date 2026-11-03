
'use client'
import { useEffect, useState } from 'react'

function isAdminUser(loginId:string, role:string){
  if(!loginId) return false
  const id=loginId.toLowerCase()
  return role==='ADMIN' || id.includes('parkhy5454')
}

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([{id:'1', name:'기출문제', icon:'📜'}, {id:'2', name:'예상문제', icon:'⭐'}])
  const [selectedType, setSelectedType] = useState('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('기출문제')
  const [uploading, setUploading] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'member'|'flipbook'>('member')

  const allQualifications = ['전기기사','전기공사기사','전기철도기사','전기산업기사','전기기능사','전기기능장','정보통신기사','정보처리기사','전자기사','토목기사','토목산업기사','측량및지형공간정보기사','기계기사','기계설계기사','가스기사','건축기사','소방설비기사(전기)']

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      loadData()
    }).catch(()=>setLoading(false))
  },[])

  function loadData(){
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{ if(Array.isArray(d) && d.length>0) setProblemTypes(d) }).catch(()=>{})
    fetch('/api/admin/users').then(r=>r.json()).then(d=> setMembers(Array.isArray(d) ? d : d.users||[])).catch(()=>{})
  }

  async function handleLogout(){
    if(!confirm('로그아웃 하시겠습니까?')) return
    try{
      await fetch('/api/auth/logout', {method:'POST'})
      localStorage.clear()
      sessionStorage.clear()
    }catch{}
    location.href='/login'
  }

  async function handleCreateType(){
    if(!newTypeName.trim()) return
    const name = newTypeName.trim()
    if(problemTypes.some((t:any)=>t.name===name)) return
    const icon = name.includes('예상') ? '⭐' : name.includes('기출') ? '📜' : '📁'
    const newType = { id: Date.now().toString(), name, icon }
    setProblemTypes(prev => [...prev, newType])
    setNewTypeName('')
    try{
      const res=await fetch('/api/admin/problem-types', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, icon})})
      const data=await res.json()
      if(res.ok && data.id) setProblemTypes(prev => prev.map((t:any)=> t.name===name ? data : t))
    }catch{}
    setSelectedType(name)
    setUploadType(name)
  }

  const filtered = flipbooks.filter(f=> selectedType==='전체' ? true : f.type===selectedType)

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}><div>로그인 필요</div><button onClick={()=>location.href='/login'} style={{marginTop:'12px', background:'#111827', color:'white', padding:'12px 20px', borderRadius:'10px', border:'none'}}>로그인으로</button></main>

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      {/* 헤더 - 로그아웃 버튼 크게! */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{fontSize:'18px', fontWeight:800}}>⚙️ MY / 설정 - PDF 플립북 관리</h1>
        <button onClick={handleLogout} style={{background:'#FEE2E2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:'10px', padding:'10px 16px', fontSize:'13px', fontWeight:800, display:'flex', alignItems:'center', gap:'6px'}}>
          🚪 로그아웃
        </button>
      </div>

      <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700, fontSize:'14px'}}>내 정보 <span style={{background:'#FFD60A', fontSize:'11px', padding:'3px 8px', borderRadius:'10px'}}>{isAdminUser(user.loginId, user.role) ? '배포자 관리자' : '일반 회원'}</span></div>
          <div style={{fontSize:'13px', marginTop:'6px', fontWeight:600}}>{user.loginId} / {user.role}</div>
          <div style={{fontSize:'11px', color:'#6B7280', marginTop:'4px'}}>관심: {(user.interests||[]).join(', ') || '없음'}</div>
        </div>
        <button onClick={handleLogout} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'10px 14px', fontSize:'12px', fontWeight:700}}>로그아웃</button>
      </div>

      <div style={{background:'white', borderRadius:'16px', padding:'12px', marginTop:'12px', display:'flex', gap:'8px'}}>
        <button onClick={()=>setActiveTab('member')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', background: activeTab==='member' ? '#111827' : '#F3F4F6', color: activeTab==='member' ? 'white' : '#6B7280', fontWeight:700, fontSize:'13px'}}>👥 회원 {members.length}명</button>
        <button onClick={()=>setActiveTab('flipbook')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', background: activeTab==='flipbook' ? '#111827' : '#F3F4F6', color: activeTab==='flipbook' ? 'white' : '#6B7280', fontWeight:700, fontSize:'13px'}}>📚 플립북 {flipbooks.length}개</button>
      </div>

      {activeTab==='member' && (
        <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'12px'}}>
          <div style={{fontWeight:700, fontSize:'13px'}}>회원 목록 - {members.length}명</div>
          {members.slice(0,20).map((m:any)=>(
            <div key={m.id} style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px', marginTop:'8px', display:'flex', justifyContent:'space-between'}}>
              <div><div style={{fontWeight:700, fontSize:'12px'}}>{m.loginId}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{m.name} - {(m.interests||[]).join(', ')}</div></div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>{m.role}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab==='flipbook' && (
        <div style={{background:'white', borderRadius:'20px', padding:'16px', marginTop:'12px'}}>
          <div style={{fontWeight:800, fontSize:'14px'}}>📚 기출 / 예상 문제 PDF 관리</div>

          <div style={{background:'#FFFBEB', borderRadius:'16px', padding:'12px', border:'1px dashed #F59E0B', marginTop:'12px', marginBottom:'12px'}}>
            <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px'}}>
              <button onClick={()=>{setSelectedType('전체'); setUploadType('기출문제')}} style={{padding:'10px 14px', borderRadius:'20px', border:'none', background: selectedType==='전체' ? '#FFD60A' : '#111827', color: selectedType==='전체' ? '#111827' : 'white', fontSize:'12px', fontWeight:800}}>전체 ({flipbooks.length})</button>
              {problemTypes.map((t:any)=>{
                const count = flipbooks.filter(f=>f.type===t.name).length
                const isSel = selectedType===t.name
                return (
                  <div key={t.id} style={{display:'flex', alignItems:'center', background: isSel ? '#FFD60A' : 'white', borderRadius:'20px', border: isSel ? '2px solid #111827' : '1px solid #E5E7EB', padding:'0 2px 0 10px'}}>
                    <button onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{background:'transparent', border:'none', fontSize:'12px', fontWeight:800, padding:'8px 2px'}}>{t.icon} {t.name} ({count})</button>
                    <button onClick={async()=>{ if(!confirm(`${t.name} 삭제?`)) return; setProblemTypes(prev=>prev.filter((x:any)=>x.id!==t.id)); try{ await fetch('/api/admin/problem-types', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:t.id})}) }catch{} }} style={{background:'transparent', border:'none', padding:'6px 8px', color:'#DC2626'}}>✕</button>
                  </div>
                )
              })}
            </div>
            <div style={{display:'flex', gap:'6px'}}>
              <input value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} placeholder="새 유형 예: 123회 예상문제" style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', fontSize:'12px'}} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); handleCreateType() } }} />
              <button onClick={handleCreateType} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'13px', fontWeight:800}}>생성</button>
            </div>
          </div>

          <div style={{background:'#F8F9FB', borderRadius:'16px', padding:'12px', border:'1px solid #F3F4F6', marginBottom:'16px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {problemTypes.map((t:any)=>{
                const count = flipbooks.filter(f=>f.type===t.name).length
                const isSelected = selectedType===t.name
                return (
                  <button key={'bottom-'+t.id} onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{padding:'14px', borderRadius:'12px', border: isSelected ? '2px solid #111827' : '1px solid #E5E7EB', fontWeight:700, fontSize:'13px', background: isSelected ? '#FFD60A' : '#F3F4F6'}}>
                    {t.icon} {t.name} ({count}개)
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={async(e)=>{ e.preventDefault(); const fileInput=document.getElementById('pdfFile') as HTMLInputElement; const file=fileInput?.files?.[0]; if(!file || !uploadTitle.trim()){ alert('제목과 파일 필요'); return } setUploading(true); try{ const fd=new FormData(); fd.append('file', file); fd.append('title', uploadTitle); fd.append('category', uploadCategory); fd.append('type', uploadType); const res=await fetch('/api/admin/upload-pdf', {method:'POST', body:fd}); if(res.ok){ alert('업로드 완료!'); setUploadTitle(''); if(fileInput) fileInput.value=''; loadData() } } finally{ setUploading(false) } }} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', display:'grid', gap:'12px'}}>
            <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>자격증 분류</div><select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', background:'white'}}>{allQualifications.map((name, idx)=> <option key={idx} value={name}>{name}</option>)}</select></div>
            <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>제목</div><input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="제목 입력" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} /></div>
            <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>PDF 파일</div><div style={{display:'flex', gap:'8px', background:'white', padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB'}}><label htmlFor="pdfFile" style={{background:'#F3F4F6', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer'}}>파일 선택</label><input id="pdfFile" type="file" accept=".pdf" style={{display:'none'}} /><span style={{fontSize:'12px', color:'#6B7280'}}>선택된 파일 없음</span></div></div>
            <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800}}>{uploading?'업로드중...':`📤 ${uploadType} 업로드`}</button>
          </form>

          <div style={{marginTop:'16px'}}>
            <div style={{fontWeight:700, fontSize:'13px'}}>{selectedType} 목록 - {filtered.length}개</div>
            {filtered.map((f:any)=>(
              <div key={f.id} style={{background:'#F8F9FB', borderRadius:'10px', padding:'12px', marginTop:'8px', display:'flex', justifyContent:'space-between'}}>
                <div><div style={{fontWeight:700, fontSize:'12px'}}>{f.title}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{f.category} / {f.type}</div></div>
                <button onClick={async()=>{ if(!confirm('삭제?')) return; await fetch('/api/admin/delete-flipbook', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:f.id})}); loadData() }} style={{background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', padding:'6px 10px', fontSize:'11px'}}>삭제</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{background:'#111827', borderRadius:'16px', padding:'16px', marginTop:'16px'}}>
        <button onClick={handleLogout} style={{width:'100%', background:'#DC2626', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontSize:'14px', fontWeight:800}}>
          🚪 로그아웃 - {user.loginId}
        </button>
        <div style={{fontSize:'11px', color:'#9CA3AF', textAlign:'center', marginTop:'8px'}}>로그아웃하면 로그인 페이지로 이동합니다</div>
      </div>
    </main>
  )
}
