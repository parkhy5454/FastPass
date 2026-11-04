
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUALS = ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사','토목기사','건축기사','기계기사','정보처리기사']

export default function MyPage(){
  const [user,setUser]=useState<any>(null)
  const [selectedQual,setSelectedQual]=useState('전기기사')
  const [problemTypes,setProblemTypes]=useState<any[]>([])
  const [newTypeName,setNewTypeName]=useState('')
  const [title,setTitle]=useState('2022년 제2회 1차 기출')
  const [pdfFile,setPdfFile]=useState<File|null>(null)
  const [uploading,setUploading]=useState(false)
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(()=>{})
    try{
      const raw=localStorage.getItem('problemTypes')
      if(raw){
        const p=JSON.parse(raw)
        if(Array.isArray(p)) setProblemTypes(p)
      }
    }catch{}
  },[])

  function saveTypes(types:any[]){
    try{
      localStorage.setItem('problemTypes', JSON.stringify(types))
      setProblemTypes(types)
      window.dispatchEvent(new CustomEvent('problemTypesUpdated',{detail:types}))
    }catch{}
  }

  function stringifyError(e:any): string {
    if(!e) return '알 수 없는 오류'
    if(typeof e === 'string') return e
    if(e instanceof Error) return e.message
    if(typeof e.message === 'string') return e.message
    if(typeof e.error === 'string') return e.error
    if(e.error && typeof e.error.message === 'string') return e.error.message
    if(typeof e.msg === 'string') return e.msg
    try { return JSON.stringify(e) } catch { return String(e) }
  }

  async function handleAddType(){
    if(!newTypeName.trim()){ alert('새 유형을 입력하세요'); return }
    const name=newTypeName.trim()
    if(problemTypes.find(t=> t.qual===selectedQual && t.name===name)){ alert('이미 존재합니다'); return }
    const nt={id:`${selectedQual}_${name}_${Date.now()}`, qual:selectedQual, name, count:0, createdAt:new Date().toISOString()}
    saveTypes([...problemTypes, nt])
    setNewTypeName('')
    try{ await fetch('/api/problem-types',{method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({qual:selectedQual, name})}) }catch{}
  }

  async function handleDelete(id:string){ if(!confirm('삭제?')) return; saveTypes(problemTypes.filter(t=> t.id!==id)) }

  async function handleUpload(){
    if(!pdfFile){ alert('PDF 선택'); return }
    setUploading(true)
    try{
      const fd=new FormData()
      fd.append('file', pdfFile)
      fd.append('qual', selectedQual)
      fd.append('title', title)
      const typesForQual=problemTypes.filter(t=> t.qual===selectedQual)
      const targetType = typesForQual.length>0 ? typesForQual[typesForQual.length-1].name : (title || '기출문제')
      fd.append('problemType', targetType)

      console.log('upload start', selectedQual, title, pdfFile.name, pdfFile.size)

      const res=await fetch('/api/upload-pdf',{method:'POST', body:fd, credentials:'include'})
      const text=await res.text()
      console.log('upload response status', res.status, text.slice(0,500))

      let data:any={}
      try{ data=JSON.parse(text) }catch{ data={error:text} }

      if(!res.ok){
        const errMsg = stringifyError(data)
        if(errMsg.includes('[object Object]') || errMsg==='{}' || errMsg==='' ) throw new Error('업로드 실패: 서버 에러 ('+res.status+') - '+text.slice(0,200))
        throw new Error(errMsg)
      }

      alert(`${selectedQual} - ${targetType} 업로드 성공! (학습 탭에서 확인 가능)`)
      saveTypes(problemTypes.map(t=> t.qual===selectedQual && t.name===targetType ? {...t, count:(t.count||0)+1} : t))
      setPdfFile(null)

    }catch(e:any){
      const msg=stringifyError(e)
      let finalMsg=msg
      if(finalMsg.includes('[object Object]') || finalMsg==='[object Object]' || finalMsg==='{}'){
        finalMsg='업로드 실패: 서버에서 객체 에러 반환. Vercel 로그를 확인하세요. 파일 크기 50MB 이하인지, PDF인지 확인하세요.'
      }
      alert(finalMsg)
      console.error('UPLOAD FAILED', e)
    }finally{ setUploading(false) }
  }

  const filteredTypes=problemTypes.filter(t=> t.qual===selectedQual)

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <button onClick={()=> router.push('/')} style={{width:32, height:32, borderRadius:16, background:'white', border:'1px solid #E9ECEF'}}>←</button>
          <div style={{fontSize:18, fontWeight:800}}>MY 페이지 - PDF 관리</div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:13, fontWeight:800, marginBottom:10}}>현재 자격증: {selectedQual}의 문제 유형</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:12}}>
            <span style={{padding:'6px 10px', background:'#1a1a2e', color:'white', borderRadius:20, fontSize:11}}>전체 ({problemTypes.length})</span>
            {filteredTypes.map(t=> (
              <span key={t.id} style={{padding:'6px 10px', background:'#FFF9DB', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11}}>{t.name} ({t.count||0}) <button onClick={()=> handleDelete(t.id)} style={{border:'none', background:'none', color:'#E5484D', cursor:'pointer'}}>✕</button></span>
            ))}
          </div>
          <div style={{display:'flex', gap:6, marginBottom:20}}>
            <input value={newTypeName} onChange={e=> setNewTypeName(e.target.value)} placeholder="새 유형 예: 123회 예상문제" style={{flex:1, padding:'10px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, background:'white'}} />
            <button onClick={handleAddType} style={{padding:'10px 14px', background:'#1a1a2e', color:'white', border:'none', borderRadius:8, fontSize:11, fontWeight:700}}>생성</button>
          </div>

          <div style={{background:'#F8F9FA', borderRadius:12, padding:12}}>
            <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>자격증 분류</div>
            <select value={selectedQual} onChange={e=> setSelectedQual(e.target.value)} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white', marginBottom:12}}>
              {QUALS.map(q=> <option key={q} value={q}>{q}</option>)}
            </select>
            <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>제목</div>
            <input value={title} onChange={e=> setTitle(e.target.value)} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />
            <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>PDF 파일</div>
            <div style={{display:'flex', gap:8, marginBottom:12, alignItems:'center'}}>
              <label style={{padding:'8px 12px', background:'white', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, cursor:'pointer'}}>파일 선택<input type="file" accept=".pdf" onChange={e=> setPdfFile(e.target.files?.[0]||null)} style={{display:'none'}} /></label>
              <span style={{fontSize:11, color:'#666', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{pdfFile ? `${pdfFile.name} (${(pdfFile.size/1024/1024).toFixed(1)}MB)` : '선택된 파일 없음'}</span>
            </div>
            <button onClick={handleUpload} disabled={uploading} style={{width:'100%', padding:'14px', background: uploading ? '#ccc' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:10, fontWeight:800, fontSize:13, cursor:'pointer'}}>
              {uploading ? '업로드 중...' : '업로드'}
            </button>
            <div style={{fontSize:10, color:'#888', marginTop:8}}>PDF만 가능, 50MB 이하. 업로드 후 학습 탭에서 자동 확인.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
