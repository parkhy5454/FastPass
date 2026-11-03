
'use client'
import { useEffect, useState } from 'react'
function isAdminUser(loginId:string, role:string){ if(!loginId) return false; const id=loginId.toLowerCase(); return role==='ADMIN' || id.includes('parkhy5454') || id.includes('parkhy') }
export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [selectedType, setSelectedType] = useState('전체')
  const [selectedFolder, setSelectedFolder] = useState('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('기출문제')
  const [uploading, setUploading] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [loading, setLoading] = useState(true)

  const allQualifications = [
    '--- 기술사 (5종) ---',
    '건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','전기철도기술사',
    '--- 기능장 (1종) ---',
    '전기기능장',
    '--- 기사 (8종) ---',
    '전기기사','전기공사기사','전기철도기사','철도신호기사','소방설비기사(전기)','건축전기설비기사','신재생에너지발전설비기사','소방설비기사(기계)',
    '--- 산업기사 (6종) ---',
    '전기산업기사','전기공사산업기사','전기철도산업기사','소방설비산업기사(전기)','건축전기설비산업기사','철도신호산업기사',
    '--- 기능사 (8종) ---',
    '전기기능사','전기공사기능사','전기철도기능사','철도전기신호기능사','소방설비기능사(전기)','승강기기능사','신재생에너지발전설비기능사','철도신호기능사',
  ]

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ setUser(d.user); setLoading(false); if(isAdminUser(d.user?.loginId, d.user?.role)) loadData() }).catch(()=>setLoading(false))
  },[])
  function loadData(){
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/categories').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setCategories(d)
      else setCategories(allQualifications.filter(x=>!x.startsWith('---')).map((name,i)=>({id: String(i), name})))
    }).catch(()=> setCategories(allQualifications.filter(x=>!x.startsWith('---')).map((name,i)=>({id: String(i), name}))))
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(Array.isArray(d) && d.length>0) setProblemTypes(d)
      else setProblemTypes([{id:'1', name:'기출문제', icon:'📜', countLabel:'10개년'}, {id:'2', name:'예상문제', icon:'⭐', countLabel:'300제'}])
    }).catch(()=> setProblemTypes([{id:'1', name:'기출문제'}, {id:'2', name:'예상문제'}]))
  }

  const filtered = flipbooks.filter(f=>{
    if(selectedType!=='전체' && f.type!==selectedType) return false
    if(selectedFolder!=='전체' && f.category!==selectedFolder) return false
    return true
  })

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인 필요</main>

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'20px', fontWeight:800}}>⚙️ MY / 설정</h1>
      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:700}}>내 정보</div>
        <div style={{marginTop:'8px', fontSize:'13px'}}>{user.loginId}</div>
      </div>

      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:800, fontSize:'14px', display:'flex', alignItems:'center', gap:'6px'}}>📚 기출 / 예상 문제 PDF 관리</div>

        <div style={{background:'#FFFBEB', borderRadius:'16px', padding:'14px', border:'1px dashed #F59E0B', marginTop:'12px', marginBottom:'16px'}}>
          <div style={{fontWeight:800, fontSize:'12px', marginBottom:'10px'}}>📂 문제 유형 관리 (생성/삭제 가능) - 123회 등</div>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px'}}>
            <button onClick={()=>setSelectedType('전체')} style={{padding:'8px 14px', borderRadius:'20px', border:'none', background: selectedType==='전체'?'#111827':'white', color: selectedType==='전체'?'white':'#6B7280', fontSize:'12px', fontWeight:700}}>전체 ({flipbooks.length})</button>
            {problemTypes.map((t:any)=>{
              const count = flipbooks.filter(f=>f.type===t.name).length
              return (
                <div key={t.id} style={{display:'flex', alignItems:'center', background: selectedType===t.name ? '#FFD60A' : 'white', borderRadius:'20px', border:'1px solid #E5E7EB', padding:'0 4px 0 12px'}}>
                  <button onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{background:'transparent', border:'none', fontSize:'12px', fontWeight:700, cursor:'pointer', padding:'8px 0'}}>{t.icon||'📄'} {t.name} ({count})</button>
                  <button onClick={async()=>{ if(!confirm(`${t.name} 삭제?`)) return; await fetch('/api/admin/problem-types', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:t.id})}); loadData() }} style={{background:'transparent', border:'none', marginLeft:'4px', cursor:'pointer', fontSize:'14px', padding:'4px 6px'}}>✕</button>
                </div>
              )
            })}
          </div>
          <div style={{display:'flex', gap:'6px'}}>
            <input value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} placeholder="새 유형 (예: 123회 예상문제)" style={{flex:1, padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB', fontSize:'12px'}} />
            <button onClick={async()=>{ if(!newTypeName.trim()) return; await fetch('/api/admin/problem-types', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newTypeName.trim(), icon:'📁'})}); setNewTypeName(''); loadData() }} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'10px 16px', fontSize:'12px', fontWeight:700}}>생성</button>
          </div>
        </div>

        <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
          {problemTypes.slice(0,2).map((t:any)=>{
            const count = flipbooks.filter(f=>f.type===t.name).length
            const isSel = selectedType===t.name
            return <button key={t.id} onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, fontSize:'13px', background: isSel ? '#FFD60A' : '#F3F4F6'}}>{t.icon} {t.name} ({count}개)</button>
          })}
          {problemTypes.length===0 && <>
            <button onClick={()=>setSelectedType('기출문제')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: selectedType==='기출문제'?'#FFD60A':'#F3F4F6'}}>📜 기출문제</button>
            <button onClick={()=>setSelectedType('예상문제')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontWeight:700, background: selectedType==='예상문제'?'#FFD60A':'#F3F4F6'}}>⭐ 예상문제</button>
          </>}
        </div>

        <form onSubmit={async(e)=>{ e.preventDefault(); const fileInput=document.getElementById('pdfFile') as HTMLInputElement; const file=fileInput?.files?.[0]; if(!file || !uploadTitle.trim()){ alert('제목과 파일 필요'); return } setUploading(true); try{ const fd=new FormData(); fd.append('file', file); fd.append('title', uploadTitle); fd.append('category', uploadCategory); fd.append('type', uploadType); const res=await fetch('/api/admin/upload-pdf', {method:'POST', body:fd}); const data=await res.json(); if(res.ok){ alert('업로드 완료!'); setUploadTitle(''); if(fileInput) fileInput.value=''; loadData() } else alert(data.error) } finally{ setUploading(false) } }} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', display:'grid', gap:'12px', border:'1px solid #F3F4F6'}}>
          <div style={{fontWeight:700, fontSize:'13px'}}>{uploadType} PDF 업로드</div>

          <div>
            <div style={{fontSize:'12px', fontWeight:700, marginBottom:'6px'}}>자격증 분류 ★ 전체 드롭다운</div>
            <select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'2px solid #111827', background:'white', fontSize:'13px', fontWeight:600}}>
              {allQualifications.map((name, idx)=>{
                if(name.startsWith('---')) return <option key={idx} disabled style={{background:'#F3F4F6', fontWeight:800}}>{name}</option>
                return <option key={idx} value={name}>{name}</option>
              })}
            </select>
            <div style={{fontSize:'10px', color:'#6B7280', marginTop:'6px'}}>💡 전체 28개 자격증이 드롭다운에 들어있습니다. 선택해서 업로드하세요.</div>
          </div>

          <div style={{background:'white', borderRadius:'10px', padding:'10px', border:'1px dashed #E5E7EB', display:'flex', gap:'6px'}}>
            <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="새 자격증 직접 추가 (예: 전기철도기사)" style={{flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #E5E7EB', fontSize:'12px'}} />
            <button type="button" onClick={async()=>{ if(!newCatName.trim()) return; await fetch('/api/admin/categories', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newCatName.trim()})}); setNewCatName(''); loadData(); alert('자격증 추가됨') }} style={{background:'#111827', color:'white', border:'none', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', fontWeight:700}}>추가</button>
          </div>

          <div>
            <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>제목</div>
            <input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="예: 2023년 전기기사 1회 기출" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
          </div>

          <div>
            <div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>PDF 파일</div>
            <div style={{display:'flex', gap:'8px', alignItems:'center', background:'white', padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB'}}>
              <label htmlFor="pdfFile" style={{background:'#F3F4F6', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', border:'1px solid #E5E7EB'}}>파일 선택</label>
              <input id="pdfFile" type="file" accept=".pdf" style={{display:'none'}} onChange={e=>{ const n=e.target.files?.[0]?.name; const el=document.getElementById('fileName'); if(el) el.textContent=n||'선택된 파일 없음' }} />
              <span id="fileName" style={{fontSize:'12px', color:'#6B7280'}}>선택된 파일 없음</span>
            </div>
          </div>

          <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800, cursor:'pointer'}}>{uploading ? '업로드중...' : `📤 ${uploadType} 업로드`}</button>
        </form>

        <div style={{marginTop:'16px'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
            <div style={{fontWeight:700, fontSize:'13px'}}>{selectedType} 목록 - {filtered.length}개</div>
            <button onClick={loadData} style={{background:'#F3F4F6', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'11px'}}>새로고침</button>
          </div>
          {filtered.map((f:any)=>(
            <div key={f.id} style={{background:'#F8F9FB', borderRadius:'10px', padding:'12px', marginBottom:'8px', display:'flex', justifyContent:'space-between'}}>
              <div><div style={{fontWeight:700, fontSize:'12px'}}>{f.title}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{f.category} / {f.type}</div><a href={`/flipbook/${f.id}`} style={{fontSize:'11px', color:'#3B82F6'}}>📖 플립북 (말림+소리+다운)</a></div>
              <button onClick={async()=>{ if(!confirm('삭제?')) return; await fetch('/api/admin/delete-flipbook', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:f.id})}); loadData() }} style={{background:'#FEE2E2', color:'#DC2626', border:'none', borderRadius:'8px', padding:'6px 10px', fontSize:'11px'}}>삭제</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
