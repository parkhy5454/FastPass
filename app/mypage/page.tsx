
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUALS = ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사','토목기사','건축기사','기계기사','정보처리기사']

export default function MyPage(){
  const [user,setUser]=useState<any>(null)
  const [tab,setTab]=useState<'profile'|'referral'|'pdf'>('pdf')
  const [selectedQual,setSelectedQual]=useState('전기기사')
  const [problemTypes,setProblemTypes]=useState<any[]>([])
  const [newTypeName,setNewTypeName]=useState('')
  const [title,setTitle]=useState('2022년 2회 기출문제(1차)')
  const [pdfFile,setPdfFile]=useState<File|null>(null)
  const [uploading,setUploading]=useState(false)
  const [pdfs,setPdfs]=useState<any[]>([])
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
      // Make admin if parkhy
      if(d.user.loginId?.includes('parkhy5454') && d.user.role!=='ADMIN'){
        fetch('/api/auth/make-admin',{method:'POST', credentials:'include'}).then(()=>{})
      }
    }).catch(()=> router.push('/login'))
    loadTypes()
    loadPdfs()
  },[])

  function loadTypes(){
    try{
      const raw = localStorage.getItem('problemTypes')
      if(raw){
        const parsed = JSON.parse(raw)
        if(Array.isArray(parsed)) setProblemTypes(parsed)
      }
    }catch(e){ console.error('loadTypes error', e); setProblemTypes([]) }
  }

  function saveTypes(types:any[]){
    try{
      localStorage.setItem('problemTypes', JSON.stringify(types))
      setProblemTypes(types)
      window.dispatchEvent(new CustomEvent('problemTypesUpdated', {detail: types}))
    }catch(e){ console.error(e) }
  }

  async function loadPdfs(){
    try{
      const res=await fetch('/api/pdfs',{credentials:'include'})
      const data=await res.json()
      setPdfs(data.pdfs||[])
    }catch{ setPdfs([]) }
  }

  async function handleAddType(){
    if(!newTypeName.trim()){
      alert('새 유형을 입력하세요 (예: 123회 예상문제)')
      return
    }
    const name = newTypeName.trim()
    const exists = problemTypes.find(t=> t.qual===selectedQual && t.name===name)
    if(exists){
      alert('이미 존재하는 유형입니다')
      return
    }
    const newType = {id: `${selectedQual}_${name}_${Date.now()}`, qual: selectedQual, name, count:0, createdAt: new Date().toISOString()}
    const updated = [...problemTypes, newType]
    saveTypes(updated)
    try{
      await fetch('/api/problem-types',{method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({qual:selectedQual, name})})
    }catch{}
    setNewTypeName('')
  }

  async function handleDeleteType(id:string, name:string){
    if(!confirm(`${name} 삭제?`)) return
    const updated = problemTypes.filter(t=> t.id!==id)
    saveTypes(updated)
    try{ await fetch(`/api/problem-types?id=${id}`,{method:'DELETE', credentials:'include'}) }catch{}
  }

  async function handleUpload(){
    if(!pdfFile){
      alert('PDF 파일을 선택하세요')
      return
    }
    if(problemTypes.filter(t=> t.qual===selectedQual).length===0){
      // Auto create type from title
      const autoName = title || '기출문제'
      const newType = {id: `${selectedQual}_${autoName}_${Date.now()}`, qual: selectedQual, name: autoName, count:0, createdAt: new Date().toISOString()}
      const updated = [...problemTypes, newType]
      saveTypes(updated)
    }

    setUploading(true)
    try{
      const fd = new FormData()
      fd.append('file', pdfFile)
      fd.append('qual', selectedQual)
      fd.append('title', title)
      const typesForQual = problemTypes.filter(t=> t.qual===selectedQual)
      const targetType = typesForQual.length>0 ? typesForQual[typesForQual.length-1].name : (title || '기출문제')
      fd.append('problemType', targetType)

      const res = await fetch('/api/upload-pdf',{
        method:'POST',
        body: fd,
        credentials:'include'
      })

      let data:any
      const text = await res.text()
      try{ data=JSON.parse(text) }catch{ data={error:text} }

      if(!res.ok){
        const errMsg = typeof data.error === 'string' ? data.error : (data.error?.message || JSON.stringify(data.error) || '업로드 실패')
        throw new Error(errMsg)
      }

      alert(`${selectedQual} - ${targetType} 업로드 성공!`)

      // Update count
      const updated = problemTypes.map(t=>{
        if(t.qual===selectedQual && t.name===targetType){
          return {...t, count: (t.count||0)+1}
        }
        return t
      })
      saveTypes(updated)
      setPdfFile(null)
      loadPdfs()

    }catch(e:any){
      // FIX: Prevent [object Object] - stringify properly
      let msg = '업로드 실패'
      if(e instanceof Error) msg = e.message
      else if(typeof e === 'string') msg = e
      else {
        try{ msg = JSON.stringify(e) }catch{ msg = String(e) }
      }
      if(msg.includes('[object Object]') || msg==='[object Object]') msg='업로드 중 오류가 발생했습니다. 파일 크기(50MB 이하)와 PDF 형식인지 확인하세요.'
      alert(msg)
      console.error('upload error', e)
    }finally{
      setUploading(false)
    }
  }

  const filteredTypes = problemTypes.filter(t=> t.qual===selectedQual)
  const isAdmin = user?.role==='ADMIN' || user?.loginId?.includes('parkhy5454')

  if(!user) return <div style={{padding:40, textAlign:'center'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <button onClick={()=> router.push('/')} style={{width:32, height:32, borderRadius:16, background:'white', border:'1px solid #E9ECEF', cursor:'pointer'}}>←</button>
          <div style={{fontSize:18, fontWeight:800}}>MY 페이지</div>
        </div>

        <div style={{display:'flex', gap:8, marginBottom:16}}>
          <button onClick={()=> setTab('profile')} style={{flex:1, padding:'12px', background: tab==='profile' ? '#1a1a2e' : 'white', color: tab==='profile' ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer'}}>내 정보</button>
          <button onClick={()=> setTab('referral')} style={{flex:1, padding:'12px', background: tab==='referral' ? '#1a1a2e' : 'white', color: tab==='referral' ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer'}}>친구추천</button>
          <button onClick={()=> setTab('pdf')} style={{flex:1, padding:'12px', background: tab==='pdf' ? 'linear-gradient(135deg, #6C5CE7 0%, #5A4BD1 100%)' : 'white', color: tab==='pdf' ? 'white' : '#666', border:'none', borderRadius:12, fontSize:12, fontWeight:700, cursor:'pointer'}}>PDF {pdfs.length}</button>
        </div>

        {tab==='pdf' && (
          <div>
            <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
              <div style={{fontSize:13, fontWeight:800, marginBottom:10}}>PDF 관리 - 현재 자격증: {selectedQual}의 문제 유형</div>

              <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:12}}>
                {filteredTypes.length===0 ? <span style={{fontSize:11, color:'#888'}}>유형 없음 - 아래에서 생성하세요</span> : filteredTypes.map(t=> (
                  <span key={t.id} style={{display:'inline-flex', alignItems:'center', gap:4, padding:'6px 10px', background: t.name.includes('기출') ? '#FFF9DB' : '#F0F4FF', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11}}>
                    {t.name} ({t.count||0})
                    {isAdmin && <button onClick={()=> handleDeleteType(t.id, t.name)} style={{background:'none', border:'none', color:'#E5484D', cursor:'pointer', fontSize:12, marginLeft:2}}>✕</button>}
                  </span>
                ))}
              </div>

              <div style={{display:'flex', gap:6, marginBottom:16}}>
                <input value={newTypeName} onChange={e=> setNewTypeName(e.target.value)} placeholder="새 유형 예: 123회 예상문제" style={{flex:1, padding:'10px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, background:'white'}} onKeyDown={e=> e.key==='Enter' && handleAddType()} />
                <button onClick={handleAddType} style={{padding:'10px 14px', background:'#1a1a2e', color:'white', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>생성</button>
              </div>

              <div style={{background:'#F8F9FA', borderRadius:12, padding:12}}>
                <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>자격증 분류</div>
                <select value={selectedQual} onChange={e=> setSelectedQual(e.target.value)} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white', marginBottom:12}}>
                  {QUALS.map(q=> <option key={q} value={q}>{q}</option>)}
                </select>

                <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>제목</div>
                <input value={title} onChange={e=> setTitle(e.target.value)} placeholder="2022년 2회 기출문제(1차)" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

                <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>PDF 파일</div>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
                  <label style={{padding:'8px 12px', background:'white', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, cursor:'pointer'}}>
                    파일 선택
                    <input type="file" accept=".pdf" onChange={e=> setPdfFile(e.target.files?.[0]||null)} style={{display:'none'}} />
                  </label>
                  <span style={{fontSize:11, color:'#666', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{pdfFile ? pdfFile.name : '선택된 파일 없음'}</span>
                </div>

                <button onClick={handleUpload} disabled={uploading} style={{width:'100%', padding:'14px', background: uploading ? '#ccc' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:10, fontWeight:800, fontSize:13, cursor:'pointer'}}>
                  {uploading ? '업로드 중...' : '업로드'}
                </button>

                <div style={{fontSize:10, color:'#888', marginTop:8, lineHeight:'1.4'}}>
                  💡 업로드 시 자동으로 학습 탭에 연동됩니다<br/>
                  - 파일: 50MB 이하 PDF<br/>
                  - 제목: {title} → {selectedQual} 폴더에 저장
                </div>
              </div>
            </div>

            <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7'}}>
              <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>업로드된 PDF ({pdfs.length}개)</div>
              {pdfs.length===0 ? <div style={{textAlign:'center', padding:20, color:'#888', fontSize:11}}>아직 업로드된 PDF가 없습니다</div> : (
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {pdfs.map((pdf:any, i:number)=> (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px', background:'#F8F9FA', borderRadius:8, border:'1px solid #EEF2F7'}}>
                      <div><div style={{fontSize:11, fontWeight:600}}>📄 {pdf.title||pdf.fileName}</div><div style={{fontSize:10, color:'#888'}}>{pdf.qual} • {pdf.problemType}</div></div>
                      <button onClick={()=> router.push(`/flipbook/${pdf.id}`)} style={{padding:'6px 10px', background:'#FFD600', border:'none', borderRadius:6, fontSize:10, fontWeight:700, cursor:'pointer'}}>보기</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
