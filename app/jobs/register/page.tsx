
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const ALL_QUALIFICATIONS = {
  '전기 (17개)': ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사'],
  '토목 (6개)': ['토목기사','토목산업기사','측량및지형공간정보기사','건설안전기사','토목시공기술사','토질및기초기술사'],
  '건축 (2개)': ['건축기사','건축산업기사'],
  '기계 (3개)': ['기계기사','기계설계기사','일반기계기사'],
  '정보통신 (2개)': ['정보처리기사','정보통신기사'],
  '기타': ['소방설비기사','위험물산업기사','산업안전기사','건축설비기사','조경기사','에너지관리기사']
}

type UploadedFile = { url:string, fileName:string, fileSize:number, fileType:string, ext?:string, isImage?:boolean, isPdf?:boolean }

export default function JobRegisterPage(){
  const [user,setUser]=useState<any>(null)
  const [type,setType]=useState<'구인'|'구직'>('구인')
  const [form,setForm]=useState({title:'', company:'', location:'서울', salary:'', cert:'전기기사', description:'', contact:''})
  const [loading,setLoading]=useState(false)
  const [showCertList,setShowCertList]=useState(false)
  const [files,setFiles]=useState<UploadedFile[]>([])
  const [uploading,setUploading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me', {credentials:'include'}).then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
      setForm(f=> ({...f, company: d.user.name||d.user.loginId||''}))
    }).catch(()=> router.push('/login'))
  },[])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
    const selected = e.target.files
    if(!selected || selected.length===0) return
    setUploading(true)
    for(let i=0;i<selected.length;i++){
      const f=selected[i]
      try{
        const fd=new FormData()
        fd.append('file', f)
        fd.append('type', type==='구인' ? 'job_post' : 'resume')
        const res=await fetch('/api/upload',{method:'POST', body: fd})
        const data=await res.json()
        if(!res.ok) throw new Error(data.error)
        setFiles(prev=> [...prev, data])
      }catch(err:any){ alert(`${f.name} 업로드 실패: ${err.message}`) }
    }
    setUploading(false)
    if(fileRef.current) fileRef.current.value=''
  }

  function removeFile(idx:number){ setFiles(files.filter((_,i)=> i!==idx)) }

  async function handleSubmit(){
    if(!form.title.trim()) return alert('제목을 입력하세요')
    if(!form.company.trim()) return alert('회사/이름을 입력하세요')
    setLoading(true)
    try{
      const res=await fetch('/api/jobs',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({type, ...form, files, paid:true, paidAmount:0, paymentId:'test-skip'})
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'등록 실패')
      alert(`${type} 등록 완료! ${files.length>0 ? `파일 ${files.length}개 첨부` : ''}`)
      router.push('/jobs')
    }catch(e:any){ alert(e.message) }finally{ setLoading(false) }
  }

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  const isJob = type==='구인'

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <button onClick={()=>router.back()} style={{width:32, height:32, borderRadius:16, background:'white', border:'1px solid #E9ECEF', cursor:'pointer'}}>←</button>
          <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>구인/구직 등록</div>
        </div>

        <div style={{background:'#FFF3CD', border:'1px solid #FFE69C', borderRadius:12, padding:10, marginBottom:12, fontSize:11, color:'#856404'}}>
          ⚠️ 테스트 모드: 결제 없이 등록 가능 / 파일 첨부 가능
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:10}}>구인/구직 선택</div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=>setType('구인')} style={{flex:1, padding:'14px', background: isJob ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'white', color: isJob ? 'white' : '#888', border: isJob ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: isJob ? 800 : 600, cursor:'pointer'}}>🏢 구인 (공고파일)</button>
            <button onClick={()=>setType('구직')} style={{flex:1, padding:'14px', background: !isJob ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: !isJob ? '#1a1a2e' : '#888', border: !isJob ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: !isJob ? 800 : 600, cursor:'pointer'}}>👤 구직 (이력서)</button>
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>제목 *</div>
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder={isJob ? '예: 전기기사 구인 - 삼성전기 (포스터 첨부 가능)' : '예: 전기기사 구직 - 경력 5년'} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>{isJob ? '회사명 *' : '이름/회사 *'}</div>
          <input value={form.company} onChange={e=>setForm({...form, company:e.target.value})} placeholder="예: 삼성전기" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12}}>
            <div>
              <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>지역</div>
              <select value={form.location} onChange={e=>setForm({...form, location:e.target.value})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white'}}>
                <option>서울</option><option>부산</option><option>인천</option><option>경기</option><option>대구</option><option>대전</option><option>광주</option><option>울산</option><option>세종</option><option>강원</option><option>충북</option><option>충남</option><option>전북</option><option>전남</option><option>경북</option><option>경남</option><option>제주</option>
              </select>
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>자격증</div>
              <div style={{position:'relative'}}>
                <button onClick={()=> setShowCertList(!showCertList)} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white', textAlign:'left', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                  <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{form.cert}</span>
                  <span>{showCertList ? '▲' : '▼'}</span>
                </button>
                {showCertList && (
                  <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #E9ECEF', borderRadius:10, maxHeight:300, overflowY:'auto', zIndex:10, marginTop:4, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
                    {Object.entries(ALL_QUALIFICATIONS).map(([group, certs])=>(
                      <div key={group}>
                        <div style={{padding:'8px 12px', background:'#F8F9FA', fontSize:11, fontWeight:700, color:'#1a1a2e', position:'sticky', top:0}}>{group}</div>
                        {certs.map(c=>(
                          <button key={c} onClick={()=>{ setForm({...form, cert:c}); setShowCertList(false) }} style={{width:'100%', padding:'10px 12px', background: form.cert===c ? '#EFF6FF' : 'white', color: form.cert===c ? '#3367D6' : '#333', border:'none', borderBottom:'1px solid #F1F3F5', fontSize:12, textAlign:'left', cursor:'pointer', fontWeight: form.cert===c ? 700 : 400}}>
                            {form.cert===c ? '✓ ' : ''}{c}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div style={{marginBottom:12, background: isJob ? '#F0F7FF' : '#FFF9DB', border: isJob ? '1px dashed #8AB4F8' : '1px dashed #FFD600', borderRadius:12, padding:14}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <div style={{fontSize:12, fontWeight:800, color:'#1a1a2e'}}>
                {isJob ? '📎 공고 이미지/PDF 첨부 (선택)' : '📎 이력서 첨부 (선택) - 한글/워드/PDF/이미지'}
              </div>
              <div style={{fontSize:10, color:'#888'}}>{files.length}개</div>
            </div>
            <div style={{fontSize:10, color:'#666', marginBottom:10, lineHeight:'1.4'}}>
              {isJob ? '• 채용공고 포스터, 모집요강 이미지(JPG/PNG) 또는 PDF 가능 - 최대 10MB, 여러개 가능' : '• 이력서 파일: 한글(.hwp/.hwpx), 워드(.doc/.docx), PDF, 이미지(JPG/PNG) - 최대 10MB'}
            </div>

            <input ref={fileRef} type="file" multiple accept={isJob ? "image/*,application/pdf" : ".hwp,.hwpx,.doc,.docx,.pdf,image/*"} onChange={handleFileChange} style={{display:'none'}} />

            <button onClick={()=> fileRef.current?.click()} disabled={uploading} style={{width:'100%', padding:'12px', background:'white', border:'1.5px solid #E9ECEF', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              {uploading ? '⏳ 업로드 중...' : isJob ? '📁 공고 파일 선택 (이미지/PDF)' : '📁 이력서 선택 (hwp/doc/pdf/이미지)'}
            </button>

            {files.length>0 && (
              <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:8}}>
                {files.map((f, idx)=>(
                  <div key={idx} style={{display:'flex', alignItems:'center', gap:8, background:'white', border:'1px solid #E9ECEF', borderRadius:10, padding:8}}>
                    {f.isImage ? (
                      <img src={f.url} alt={f.fileName} style={{width:40, height:40, objectFit:'cover', borderRadius:6, border:'1px solid #EEE'}} />
                    ) : (
                      <div style={{width:40, height:40, background: f.isPdf ? '#FFEBEE' : f.ext==='hwp' || f.ext==='hwpx' ? '#E3F2FD' : '#FFF3E0', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800}}>
                        {f.isPdf ? 'PDF' : (f.ext||'FILE').toUpperCase().slice(0,4)}
                      </div>
                    )}
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:11, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{f.fileName}</div>
                      <div style={{fontSize:9, color:'#888'}}>{(f.fileSize/1024).toFixed(0)}KB • {f.isImage ? '이미지' : f.ext}</div>
                    </div>
                    <button onClick={()=> removeFile(idx)} style={{width:24, height:24, background:'#FFF1F1', border:'1px solid #FFD1D1', borderRadius:12, cursor:'pointer', fontSize:12}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>급여/연봉</div>
          <input value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} placeholder="예: 4000만원~" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>상세 설명</div>
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder={isJob ? "자격 요건, 우대 사항, 복리후생 (이미지는 위에서 첨부)" : "경력, 보유 자격증, 자기소개 (이력서는 위에서 첨부)"} rows={4} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', resize:'none', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>연락처</div>
          <input value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} placeholder="010-1234-5678" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:16, boxSizing:'border-box', background:'white'}} />

          <button onClick={handleSubmit} disabled={loading} style={{width:'100%', padding:14, background: loading ? '#ccc' : isJob ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color: isJob || loading ? 'white' : '#1a1a2e', border:'none', borderRadius:12, fontWeight:800, fontSize:13, cursor:'pointer'}}>{loading ? '등록 중...' : `${type} 등록하기${files.length>0 ? ` (파일 ${files.length}개)` : ''}`}</button>
        </div>
      </div>
    </div>
  )
}
