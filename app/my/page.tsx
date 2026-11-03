
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
  const [activeTab, setActiveTab] = useState<'members'|'problems'>('members')
  const [problemType, setProblemType] = useState<'기출문제'|'예상문제'|'전체'>('전체')
  const [selectedFolder, setSelectedFolder] = useState('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

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
    fetch('/api/admin/categories').then(r=>r.json()).then(d=>{ if(Array.isArray(d) && d.length>0) setCategories(d); else setCategories([{id:'1', name:'전기기사'}]) }).catch(()=>{ setCategories([{id:'1', name:'전기기사'}]) })
  }
  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }
  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요</main>
  const isAdmin = isAdminUser(user.loginId, user.role)
  const filteredFlipbooks = flipbooks.filter(f=>{ if(selectedFolder!=='전체' && f.category!==selectedFolder) return false; if(problemType!=='전체' && f.type!==problemType) return false; return true })

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px', fontWeight:800}}>⚙️ MY / 설정 - PDF 플립북 관리</h1>
      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:700}}>내 정보 {isAdmin && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px'}}>배포자 관리자</span>}</div>
        <div style={{marginTop:'10px'}}>{user.loginId} / {isAdmin ? 'ADMIN' : 'USER'}</div>
      </div>
      {isAdmin && (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            <button onClick={()=>setActiveTab('members')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: activeTab==='members'?'#111827':'#F3F4F6', color: activeTab==='members'?'white':'#6B7280'}}>👥 회원 {users.length}명</button>
            <button onClick={()=>setActiveTab('problems')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: activeTab==='problems'?'#111827':'#F3F4F6', color: activeTab==='problems'?'white':'#6B7280'}}>📚 플립북 {flipbooks.length}개</button>
          </div>
          {activeTab==='problems' && (
            <div>
              <div style={{background:'#ECFDF5', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
                <div style={{fontWeight:800, fontSize:'14px'}}>📖 플립북 기능 설명</div>
                <div style={{fontSize:'12px', marginTop:'8px', lineHeight:'1.6'}}>
                  ✅ 관리자가 PDF 업로드 → 자동 플립북 변환<br/>
                  ✅ 페이지 말리면서 넘어가는 효과 (3D)<br/>
                  ✅ 종이 넘기는 소리 🔊<br/>
                  ✅ 사용자가 PDF 원본 다운로드 가능 📥<br/>
                  ✅ 폴더 생성/수정/삭제 가능<br/>
                  ✅ /flipbook/[id] 에서 플립북 보기
                </div>
              </div>

              <div style={{background:'#FFFBEB', borderRadius:'12px', padding:'12px', marginBottom:'12px', display:'flex', gap:'8px'}}>
                <input value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} placeholder="새 폴더 이름 (예: 전기철도기사)" style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #E5E7EB'}} />
                <button onClick={async()=>{ if(!newFolderName.trim()) return; await fetch('/api/admin/categories', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newFolderName})}); setNewFolderName(''); loadData() }} style={{background:'#111827', color:'white', border:'none', borderRadius:'8px', padding:'10px 16px', fontWeight:700, cursor:'pointer'}}>생성</button>
              </div>

              <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px'}}>
                <button onClick={()=>setSelectedFolder('전체')} style={{padding:'8px 12px', borderRadius:'20px', border:'1px solid', background: selectedFolder==='전체'?'#111827':'white', color: selectedFolder==='전체'?'white':'#6B7280', fontSize:'12px', fontWeight:700}}>전체 ({flipbooks.length})</button>
                {categories.map((c:any)=>{ const count=flipbooks.filter((f:any)=>f.category===c.name).length; return <button key={c.id} onClick={()=>setSelectedFolder(c.name)} style={{padding:'8px 12px', borderRadius:'20px', border:'1px solid', background: selectedFolder===c.name?'#FFD60A':'white', fontSize:'12px', fontWeight:700}}>📁 {c.name} ({count})</button> })}
              </div>

              <form onSubmit={async(e)=>{ e.preventDefault(); const fileInput=document.getElementById('pdfFile') as HTMLInputElement; const file=fileInput?.files?.[0]; if(!file || !uploadTitle.trim()){ alert('제목과 파일 필요'); return } setUploading(true); try{ const fd=new FormData(); fd.append('file', file); fd.append('title', uploadTitle); fd.append('category', uploadCategory); fd.append('type', problemType==='전체'?'기출문제':problemType); const res=await fetch('/api/admin/upload-pdf', {method:'POST', body:fd}); const data=await res.json(); if(res.ok){ alert('업로드 완료! 플립북으로 변환됨 - 페이지 말림 + 소리 + 다운로드 가능'); setUploadTitle(''); if(fileInput) fileInput.value=''; loadData() } else alert(data.error) } finally{ setUploading(false) } }} style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px', display:'grid', gap:'8px'}}>
                <div style={{fontWeight:700, fontSize:'13px'}}>📤 PDF → 플립북 업로드</div>
                <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{padding:'10px', borderRadius:'8px', border:'1px solid #E5E7EB'}}>{categories.map((c:any)=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
                <input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="제목 (예: 2023 전기기사 기출)" style={{padding:'10px', borderRadius:'8px', border:'1px solid #E5E7EB'}} />
                <input id="pdfFile" type="file" accept=".pdf" style={{padding:'10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'white'}} />
                <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'10px', padding:'12px', fontWeight:800, cursor:'pointer'}}>{uploading?'업로드중...':'📤 플립북 업로드'}</button>
              </form>

              <div style={{marginTop:'16px'}}>
                {filteredFlipbooks.map((f:any)=>(
                  <div key={f.id} style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px', marginBottom:'8px', display:'flex', justifyContent:'space-between'}}>
                    <div><div style={{fontWeight:700, fontSize:'12px'}}>{f.title}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{f.category} / {f.type} - 플립북 (말림+소리+다운 가능)</div><a href={`/flipbook/${f.id}`} style={{fontSize:'11px', color:'#3B82F6'}}>📖 플립북 보기</a></div>
                    <button onClick={async()=>{ if(!confirm('삭제?')) return; await fetch('/api/admin/delete-flipbook', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:f.id})}); loadData() }} style={{background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', padding:'6px 10px', fontSize:'11px', cursor:'pointer'}}>삭제</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
