
'use client'
import { useState, useEffect } from 'react'
import { getProblemTypes, addProblemType, removeProblemType, saveProblemTypes, QUALIFICATIONS_ALL } from '@/lib/problemTypes'

export default function QualificationFolder({ user }: { user: any }){
  const [selectedQual, setSelectedQual] = useState('전기기사')
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [newTypeName, setNewTypeName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [showQualList, setShowQualList] = useState(false)

  const isAdmin = user?.role==='ADMIN' || user?.loginId?.includes('parkhy5454')

  useEffect(()=>{
    loadTypes()
    const handler = () => loadTypes()
    window.addEventListener('problemTypesUpdated', handler)
    window.addEventListener('storage', handler)
    return ()=> {
      window.removeEventListener('problemTypesUpdated', handler)
      window.removeEventListener('storage', handler)
    }
  },[])

  async function loadTypes(){
    // Load from localStorage first
    try{
      const local = localStorage.getItem('problemTypes')
      if(local){
        const parsed = JSON.parse(local)
        setProblemTypes(parsed)
        return
      }
    }catch{}
    // Fallback to API
    try{
      const res = await fetch('/api/problem-types')
      const data = await res.json()
      if(data.problemTypes){
        setProblemTypes(data.problemTypes)
        localStorage.setItem('problemTypes', JSON.stringify(data.problemTypes))
      }
    }catch{}
  }

  async function handleAddType(){
    if(!newTypeName.trim()) return alert('문제 유형을 입력하세요 (예: 2022년 2회 기출문제)')
    const qual = selectedQual
    const name = newTypeName.trim()

    // Save to localStorage immediately for Learn sync
    const existing = problemTypes.find(t=> t.qual===qual && t.name===name)
    if(existing){
      alert('이미 존재하는 유형입니다')
      return
    }

    const newType = {
      id: `${qual}_${name}_${Date.now()}`,
      qual,
      name,
      count: 0,
      createdAt: new Date().toISOString()
    }

    const updated = [...problemTypes, newType]
    setProblemTypes(updated)
    saveProblemTypes(updated)

    // Also save to API
    try{
      await fetch('/api/problem-types',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({qual, name, count:0})
      })
    }catch{}

    setNewTypeName('')
    alert(`${qual} - ${name} 폴더 생성! 학습 탭에서 바로 확인 가능!`)
  }

  async function handleDeleteType(id: string, name: string){
    if(!confirm(`${name} 폴더를 삭제하시겠습니까?`)) return
    const updated = problemTypes.filter(t=> t.id!==id)
    setProblemTypes(updated)
    saveProblemTypes(updated)
    try{
      await fetch(`/api/problem-types?id=${id}`,{method:'DELETE', credentials:'include'})
    }catch{}
  }

  async function handlePdfUpload(){
    if(!pdfFile) return alert('PDF 파일을 선택하세요')
    if(problemTypes.filter(t=> t.qual===selectedQual).length===0){
      return alert('먼저 문제 유형 폴더를 생성하세요 (예: 2022년 2회 기출문제)')
    }
    setUploading(true)
    try{
      const fd = new FormData()
      fd.append('file', pdfFile)
      fd.append('qual', selectedQual)
      // Use the latest type for this qual as target
      const typesForQual = problemTypes.filter(t=> t.qual===selectedQual)
      const targetType = typesForQual[typesForQual.length-1]?.name || '기출문제'
      fd.append('problemType', targetType)

      const res = await fetch('/api/upload-pdf',{
        method:'POST',
        body: fd,
        credentials:'include'
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error)

      // Update count
      const updated = problemTypes.map(t=> {
        if(t.qual===selectedQual && t.name===targetType){
          return {...t, count: (t.count||0)+ (data.count||100)}
        }
        return t
      })
      setProblemTypes(updated)
      saveProblemTypes(updated)

      alert(`${selectedQual} - ${targetType} PDF 업로드 성공! 학습 탭에서 확인하세요!`)
      setPdfFile(null)
    }catch(e:any){ alert(e.message) }finally{ setUploading(false) }
  }

  const filteredTypes = problemTypes.filter(t=> t.qual===selectedQual)

  return (
    <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:16}}>
      <div style={{fontSize:14, fontWeight:800, marginBottom:12, display:'flex', alignItems:'center', gap:6}}>
        📁 자격증 폴더 관리 (학습 탭 연동)
        <span style={{fontSize:10, background:'#EFF6FF', color:'#3367D6', padding:'2px 6px', borderRadius:6}}>학습 연동됨</span>
      </div>

      <div style={{fontSize:11, color:'#666', marginBottom:12, background:'#F8F9FA', padding:10, borderRadius:8, lineHeight:'1.5'}}>
        💡 사용법:<br/>
        1. 자격증 선택 (예: 전기기사)<br/>
        2. 문제 유형 생성 (예: 2022년 2회 기출문제, 기출 10년, 예상문제)<br/>
        3. PDF 업로드 → 학습 탭에서 자동 표시!<br/>
        <span style={{color:'#E5484D', fontWeight:700}}>현재 선택: {selectedQual} ({filteredTypes.length}개 유형)</span>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>자격증 선택</div>
        <div style={{position:'relative'}}>
          <button onClick={()=> setShowQualList(!showQualList)} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white', textAlign:'left', display:'flex', justifyContent:'space-between', cursor:'pointer'}}>
            <span>{selectedQual}</span><span>{showQualList?'▲':'▼'}</span>
          </button>
          {showQualList && (
            <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #E9ECEF', borderRadius:10, maxHeight:250, overflowY:'auto', zIndex:10, marginTop:4}}>
              {QUALIFICATIONS_ALL.map(q=> (
                <button key={q} onClick={()=>{ setSelectedQual(q); setShowQualList(false) }} style={{width:'100%', padding:'10px 12px', background: selectedQual===q ? '#EFF6FF' : 'white', color: selectedQual===q ? '#3367D6' : '#333', border:'none', borderBottom:'1px solid #F1F3F5', fontSize:12, textAlign:'left', cursor:'pointer', fontWeight: selectedQual===q ? 700 : 400}}>
                  {selectedQual===q?'✓ ':''}{q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{marginBottom:12, background:'#F0F7FF', borderRadius:12, padding:12, border:'1px dashed #8AB4F8'}}>
        <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>{selectedQual} - 문제 유형 추가</div>
        <div style={{display:'flex', gap:6}}>
          <input value={newTypeName} onChange={e=> setNewTypeName(e.target.value)} placeholder="예: 2022년 2회 기출문제, 기출 10년, 예상문제" style={{flex:1, padding:'10px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, background:'white'}} onKeyDown={e=> e.key==='Enter' && handleAddType()} />
          <button onClick={handleAddType} style={{padding:'10px 14px', background:'#3367D6', color:'white', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>추가</button>
        </div>
        <div style={{fontSize:9, color:'#888', marginTop:6}}>💡 예: "2022년 2회 기출문제" 입력 → 학습 탭에 "2022년 2회 기출문제" 탭 생성!</div>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>{selectedQual} 폴더 목록 ({filteredTypes.length}개) - 학습 탭과 연동됨</div>
        {filteredTypes.length===0 ? (
          <div style={{padding:20, textAlign:'center', background:'#F8F9FA', borderRadius:10, fontSize:11, color:'#888'}}>
            아직 생성된 유형이 없습니다<br/>위에서 "2022년 2회 기출문제" 등 입력 후 추가 버튼을 누르세요
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {filteredTypes.map(t=> (
              <div key={t.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'white', border:'1px solid #E9ECEF', borderRadius:10}}>
                <div>
                  <div style={{fontSize:12, fontWeight:600}}>📄 {t.name}</div>
                  <div style={{fontSize:10, color:'#888'}}>{t.qual} • {t.count||0}문제 • {new Date(t.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{display:'flex', gap:4}}>
                  <span style={{fontSize:9, background:'#E8F5E9', color:'#2E7D32', padding:'2px 6px', borderRadius:6}}>학습 연동</span>
                  {isAdmin && <button onClick={()=> handleDeleteType(t.id, t.name)} style={{padding:'4px 8px', background:'#FFF1F1', color:'#E5484D', border:'1px solid #FFD1D1', borderRadius:6, fontSize:10, cursor:'pointer'}}>삭제</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={{background:'#FFF9DB', border:'1px solid #FFE69C', borderRadius:12, padding:12}}>
          <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>📤 PDF 업로드 → {selectedQual}</div>
          <input type="file" accept=".pdf" onChange={e=> setPdfFile(e.target.files?.[0]||null)} style={{width:'100%', fontSize:11, marginBottom:8}} />
          {pdfFile && <div style={{fontSize:10, color:'#666', marginBottom:8}}>선택됨: {pdfFile.name} ({(pdfFile.size/1024/1024).toFixed(1)}MB)</div>}
          <button onClick={handlePdfUpload} disabled={uploading || !pdfFile} style={{width:'100%', padding:'10px', background: uploading || !pdfFile ? '#ccc' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>
            {uploading ? '업로드 중...' : `📄 ${selectedQual}에 PDF 업로드`}
          </button>
          <div style={{fontSize:9, color:'#856404', marginTop:6}}>업로드 시 마지막으로 생성한 문제 유형에 자동 연결됩니다</div>
        </div>
      )}
    </div>
  )
}
