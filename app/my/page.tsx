
'use client'
import { useEffect, useState } from 'react'
function isAdminUser(loginId:string, role:string){ if(!loginId) return false; const id=loginId.toLowerCase(); return role==='ADMIN' || id.includes('parkhy5454') || id.includes('parkhy') }
export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([
    {id:'1', name:'기출문제', icon:'📜'},
    {id:'2', name:'예상문제', icon:'⭐'},
  ])
  const [selectedType, setSelectedType] = useState('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('기출문제')
  const [uploading, setUploading] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [loading, setLoading] = useState(true)

  const allQualifications = [
    '--- 기술사 ---','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','전기철도기술사',
    '--- 기능장 ---','전기기능장',
    '--- 기사 ---','전기기사','전기공사기사','전기철도기사','철도신호기사','소방설비기사(전기)','건축전기설비기사','신재생에너지발전설비기사',
    '--- 산업기사 ---','전기산업기사','전기공사산업기사','전기철도산업기사','소방설비산업기사(전기)',
    '--- 기능사 ---','전기기능사','전기공사기능사','전기철도기능사','소방설비기능사(전기)','승강기기능사','신재생에너지발전설비기능사',
  ]

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ setUser(d.user); setLoading(false); if(isAdminUser(d.user?.loginId, d.user?.role)) loadData() }).catch(()=>setLoading(false))
  },[])

  function loadData(){
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setProblemTypes(d)
    }).catch(()=>{})
  }

  // 생성 - 즉시 아래에도 표시되게!
  async function handleCreateType(){
    if(!newTypeName.trim()) return alert('이름을 입력하세요! 예: 123회 예상문제')
    const name = newTypeName.trim()
    if(problemTypes.some((t:any)=>t.name===name)) return alert('이미 있는 유형입니다')
    const icon = name.includes('예상') ? '⭐' : name.includes('기출') ? '📜' : '📁'
    const newType = { id: Date.now().toString(), name, icon, countLabel:'' }
    
    // 1. 즉시 화면에 추가 (아래에도 바로 보이게!)
    setProblemTypes(prev => [...prev, newType])
    setNewTypeName('')
    
    // 2. 서버에도 저장 시도
    try{
      const res = await fetch('/api/admin/problem-types', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, icon})})
      const data = await res.json()
      if(res.ok && data.id){
        // 서버에서 받은 ID로 교체
        setProblemTypes(prev => prev.map(t=> t.name===name ? data : t))
      }
    }catch{}
    
    // 3. 자동 선택 (노랗게)
    setSelectedType(name)
    setUploadType(name)
    alert(`✅ ${name} 생성됨! 위-아래 모두에 표시되고 노랗게 선택됨`)
  }

  async function handleDeleteType(id:string, name:string){
    if(!confirm(`${name} 삭제?`)) return
    setProblemTypes(prev => prev.filter(t=>t.id!==id))
    if(selectedType===name){ setSelectedType('전체'); setUploadType('기출문제') }
    try{ await fetch('/api/admin/problem-types', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})}) }catch{}
  }

  const filtered = flipbooks.filter(f=> selectedType==='전체' ? true : f.type===selectedType)

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요</main>

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'18px', fontWeight:800, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span>⚙️ MY / 설정</span>
        <button onClick={async()=>{ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }} style={{background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
      </h1>

      <div style={{background:'white', borderRadius:'20px', padding:'16px', marginTop:'12px'}}>
        <div style={{fontWeight:800, fontSize:'14px'}}>📚 기출 / 예상 문제 PDF 관리</div>

        {/* 위 관리 영역 */}
        <div style={{background:'#FFFBEB', borderRadius:'16px', padding:'12px', border:'2px dashed #F59E0B', marginTop:'12px', marginBottom:'12px'}}>
          <div style={{fontWeight:800, fontSize:'12px', marginBottom:'8px'}}>📂 문제 유형 관리 (생성/삭제 가능) - 123회 등 - 위에서 만들면 아래에도 표시!</div>
          
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px'}}>
            <button onClick={()=>{setSelectedType('전체'); setUploadType('기출문제')}} style={{padding:'10px 14px', borderRadius:'20px', border:'none', background: selectedType==='전체'?'#111827':'#111827', color:'white', fontSize:'12px', fontWeight:800, cursor:'pointer'}}>전체 ({flipbooks.length})</button>
            {problemTypes.map((t:any)=>{
              const count = flipbooks.filter(f=>f.type===t.name).length
              const isSel = selectedType===t.name
              return (
                <div key={t.id} style={{display:'flex', alignItems:'center', background: isSel ? '#FFD60A' : 'white', borderRadius:'20px', border: isSel ? '2px solid #111827' : '1px solid #E5E7EB', padding:'0 2px 0 10px'}}>
                  <button onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{background:'transparent', border:'none', fontSize:'12px', fontWeight:800, cursor:'pointer', padding:'8px 2px'}}>{t.icon} {t.name} ({count})</button>
                  <button onClick={()=>handleDeleteType(t.id, t.name)} style={{background:'transparent', border:'none', marginLeft:'4px', cursor:'pointer', fontSize:'14px', padding:'6px 8px', color:'#DC2626'}}>✕</button>
                </div>
              )
            })}
          </div>

          <div style={{display:'flex', gap:'6px'}}>
            <input value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} placeholder="새 유형 예: 123회 예상문제" style={{flex:1, padding:'12px', borderRadius:'10px', border:'2px solid #111827', fontSize:'12px', fontWeight:600}} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); handleCreateType() } }} />
            <button onClick={handleCreateType} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'13px', fontWeight:800, cursor:'pointer'}}>생성</button>
          </div>
          <div style={{fontSize:'10px', color:'#92400E', marginTop:'8px'}}>💡 생성하면 위-아래 모두에 바로 나타남 + 노랗게 선택됨</div>
        </div>

        {/* 아래 영역 - 위에서 생성한게 여기에 자동 표시 + 연동! */}
        <div style={{background:'#F0FDF4', borderRadius:'16px', padding:'12px', border:'2px dashed #10B981', marginBottom:'16px'}}>
          <div style={{fontSize:'12px', fontWeight:800, color:'#065F46', marginBottom:'10px', display:'flex', justifyContent:'space-between'}}>
            <span>↓ 아래 버튼들 - 위에서 생성한 유형이 여기에 자동 표시됨 (123회 등) - 클릭하면 위-아래 연동 노랗게!</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
            {problemTypes.map((t:any)=>{
              const count = flipbooks.filter(f=>f.type===t.name).length
              const isSelected = selectedType===t.name // 위와 같은 조건으로 연동!
              return (
                <button key={'bottom-'+t.id} onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{
                  padding:'14px', borderRadius:'12px', border: isSelected ? '3px solid #111827' : '1px solid #E5E7EB',
                  fontWeight:800, fontSize:'13px', cursor:'pointer',
                  background: isSelected ? '#FFD60A' : '#F3F4F6',
                  color:'#111827',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition:'all 0.2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
                }}>
                  {t.icon} {t.name} ({count}개) {isSelected && '✓'}
                </button>
              )
            })}
          </div>
          <div style={{fontSize:'11px', color:'#065F46', marginTop:'8px', background:'white', padding:'8px', borderRadius:'8px'}}>
            ✅ 위에서 "123회 예상문제" 생성 → 아래에 자동으로 노란 버튼으로 생김<br/>
            ✅ 아래 버튼 클릭 → 위-아래 모두 노랗게 연동 (선택됨)
          </div>
        </div>

        {/* 업로드 폼 - 자격증 전체 드롭다운 */}
        <form onSubmit={async(e)=>{ e.preventDefault(); const fileInput=document.getElementById('pdfFile') as HTMLInputElement; const file=fileInput?.files?.[0]; if(!file || !uploadTitle.trim()){ alert('제목과 파일 필요'); return } setUploading(true); try{ const fd=new FormData(); fd.append('file', file); fd.append('title', uploadTitle); fd.append('category', uploadCategory); fd.append('type', uploadType); const res=await fetch('/api/admin/upload-pdf', {method:'POST', body:fd}); if(res.ok){ alert(`${uploadType} 업로드 완료!`); setUploadTitle(''); if(fileInput) fileInput.value=''; const el=document.getElementById('fileName'); if(el) el.textContent='선택된 파일 없음'; loadData() } } finally{ setUploading(false) } }} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', display:'grid', gap:'12px'}}>
          <div style={{fontWeight:700, fontSize:'13px'}}>📤 {uploadType} PDF 업로드 - 선택된 유형: {uploadType} ({uploadCategory})</div>
          <div>
            <div style={{fontSize:'12px', fontWeight:700, marginBottom:'6px'}}>자격증 분류 (28개 전체)</div>
            <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid #111827', background:'white', fontWeight:600}}>
              {allQualifications.map((name, idx)=> name.startsWith('---') ? <option key={idx} disabled>{name}</option> : <option key={idx} value={name}>{name}</option>)}
            </select>
          </div>
          <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>제목</div><input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder={`예: ${uploadType} - 123회`} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} /></div>
          <div>
            <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>PDF 파일</div>
            <div style={{display:'flex', gap:'8px', background:'white', padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB'}}>
              <label htmlFor="pdfFile" style={{background:'#F3F4F6', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer'}}>파일 선택</label>
              <input id="pdfFile" type="file" accept=".pdf" style={{display:'none'}} onChange={e=>{ const el=document.getElementById('fileName'); if(el) el.textContent=e.target.files?.[0]?.name||'선택된 파일 없음' }} />
              <span id="fileName" style={{fontSize:'12px', color:'#6B7280'}}>선택된 파일 없음</span>
            </div>
          </div>
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

      <button onClick={async()=>{ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }} style={{width:'100%', marginTop:'16px', background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700}}>로그아웃 (하단)</button>
    </main>
  )
}
