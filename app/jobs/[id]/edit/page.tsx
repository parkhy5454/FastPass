
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

const ALL_QUALIFICATIONS = {
  '전기 (17개)': ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사'],
  '토목 (6개)': ['토목기사','토목산업기사','측량및지형공간정보기사','건설안전기사','토목시공기술사','토질및기초기술사'],
  '건축 (2개)': ['건축기사','건축산업기사'],
  '기계 (3개)': ['기계기사','기계설계기사','일반기계기사'],
  '정보통신 (2개)': ['정보처리기사','정보통신기사'],
  '기타': ['소방설비기사','위험물산업기사','산업안전기사','건축설비기사','조경기사','에너지관리기사']
}

type UploadedFile = { url:string, fileName:string, fileSize:number, fileType:string, ext?:string, isImage?:boolean, isPdf?:boolean }

function formatSalaryInput(v: string): string {
  if (!v) return ''
  if (v.includes('협의')) return v
  const digitsOnly = v.replace(/[^0-9]/g, '')
  if (!digitsOnly) return v
  const num = parseInt(digitsOnly, 10)
  if (isNaN(num)) return v
  const formatted = num.toLocaleString('ko-KR')
  let hasTilde = v.includes('~')
  let suffix = ''
  if (v.includes('만원')) suffix='만원'
  else if (v.includes('원')) suffix='원'
  let result = formatted + suffix
  if (hasTilde && !result.includes('~')) result += '~'
  return result
}
function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/[^0-9]/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0,3)}-${numbers.slice(3)}`
  if (numbers.length <= 10) {
    if (numbers.startsWith('02')) {
      if (numbers.length <= 5) return `${numbers.slice(0,2)}-${numbers.slice(2)}`
      return `${numbers.slice(0,2)}-${numbers.slice(2,6)}-${numbers.slice(6)}`
    }
    return `${numbers.slice(0,3)}-${numbers.slice(3,6)}-${numbers.slice(6)}`
  }
  if (numbers.length === 11) return `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7)}`
  return `${numbers.slice(0,3)}-${numbers.slice(3,7)}-${numbers.slice(7,11)}`
}

export default function JobEditPage(){
  const params = useParams()
  const id = params?.id as string
  const [user,setUser]=useState<any>(null)
  const [type,setType]=useState<'구인'|'구직'>('구인')
  const [form,setForm]=useState({title:'', company:'', location:'서울', salary:'', cert:'전기기사', description:'', contact:''})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState(false)
  const [showCertList,setShowCertList]=useState(false)
  const [files,setFiles]=useState<UploadedFile[]>([])
  const [uploading,setUploading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const router=useRouter()

  useEffect(()=>{
    async function init(){
      try{
        const meRes = await fetch('/api/auth/me',{credentials:'include'})
        const meData = await meRes.json()
        if(!meData.user){ router.push('/login'); return }
        setUser(meData.user)

        // fetch job
        const jobsRes = await fetch('/api/jobs',{credentials:'include'})
        const jobsData = await jobsRes.json()
        const job = jobsData.jobs?.find((j:any)=> j.id===id)
        if(!job){
          alert('공고를 찾을 수 없습니다')
          router.push('/jobs')
          return
        }
        // check ownership
        const isOwner = job.userId===meData.user.id
        const isAdmin = meData.user.role==='ADMIN' || meData.user.loginId?.includes('parkhy5454')
        if(!isOwner && !isAdmin){
          alert('본인 공고만 수정 가능')
          router.push('/jobs')
          return
        }
        setType(job.type)
        setForm({
          title: job.title||'',
          company: job.company||'',
          location: job.location||'서울',
          salary: job.salary||'',
          cert: job.cert||'전기기사',
          description: job.description||'',
          contact: job.contact||'',
        })
        setFiles(job.files||[])
      }catch(e){ alert('로딩 실패') }
      finally{ setLoading(false) }
    }
    init()
  },[id])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
    const selected = e.target.files
    if(!selected) return
    setUploading(true)
    for(let i=0;i<selected.length;i++){
      const f=selected[i]
      try{
        const fd=new FormData()
        fd.append('file', f)
        const res=await fetch('/api/upload',{method:'POST', body: fd})
        const data=await res.json()
        if(!res.ok) throw new Error(data.error)
        setFiles(prev=> [...prev, data])
      }catch(err:any){ alert(`${f.name} 실패: ${err.message}`) }
    }
    setUploading(false)
    if(fileRef.current) fileRef.current.value=''
  }

  async function handleUpdate(){
    if(!form.title.trim()) return alert('제목을 입력하세요')
    setSaving(true)
    try{
      const res=await fetch(`/api/jobs/${id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({type, ...form, files})
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error)
      alert('수정 완료!')
      router.push('/jobs')
    }catch(e:any){ alert(e.message) }finally{ setSaving(false) }
  }

  async function handleDelete(){
    if(!confirm('정말 삭제하시겠습니까?')) return
    try{
      const res=await fetch(`/api/jobs?id=${id}`,{method:'DELETE', credentials:'include'})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error)
      alert('삭제 완료')
      router.push('/jobs')
    }catch(e:any){ alert(e.message) }
  }

  if(loading) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  const isJob = type==='구인'

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <button onClick={()=>router.back()} style={{width:32, height:32, borderRadius:16, background:'white', border:'1px solid #E9ECEF', cursor:'pointer'}}>←</button>
            <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>공고 수정</div>
          </div>
          <button onClick={handleDelete} style={{padding:'6px 12px', background:'#FFF1F1', color:'#E5484D', border:'1px solid #FFD1D1', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>삭제</button>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:10}}>구인/구직</div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=>setType('구인')} style={{flex:1, padding:'12px', background: isJob ? '#1a1a2e' : 'white', color: isJob ? 'white' : '#888', border: isJob ? 'none' : '1px solid #E9ECEF', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer'}}>🏢 구인</button>
            <button onClick={()=>setType('구직')} style={{flex:1, padding:'12px', background: !isJob ? '#FFD600' : 'white', color: !isJob ? '#1a1a2e' : '#888', border: !isJob ? 'none' : '1px solid #E9ECEF', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer'}}>👤 구직</button>
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>제목 *</div>
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>{isJob ? '회사명 *' : '이름 *'}</div>
          <input value={form.company} onChange={e=>setForm({...form, company:e.target.value})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

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
                <button onClick={()=> setShowCertList(!showCertList)} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white', textAlign:'left', display:'flex', justifyContent:'space-between', cursor:'pointer'}}>
                  <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{form.cert}</span><span>{showCertList?'▲':'▼'}</span>
                </button>
                {showCertList && (
                  <div style={{position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1px solid #E9ECEF', borderRadius:10, maxHeight:250, overflowY:'auto', zIndex:10, marginTop:4}}>
                    {Object.entries(ALL_QUALIFICATIONS).map(([group, certs])=>(
                      <div key={group}><div style={{padding:'6px 10px', background:'#F8F9FA', fontSize:10, fontWeight:700}}>{group}</div>{certs.map(c=> (<button key={c} onClick={()=>{ setForm({...form, cert:c}); setShowCertList(false) }} style={{width:'100%', padding:'8px 10px', background: form.cert===c ? '#EFF6FF' : 'white', border:'none', borderBottom:'1px solid #F1F3F5', fontSize:11, textAlign:'left', cursor:'pointer'}}>{form.cert===c?'✓ ':''}{c}</button>))}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{marginBottom:12, background:'#F8F9FA', border:'1px dashed #DDD', borderRadius:12, padding:12}}>
            <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>📎 첨부 파일 ({files.length}개)</div>
            <input ref={fileRef} type="file" multiple accept=".hwp,.hwpx,.doc,.docx,.pdf,image/*" onChange={handleFileChange} style={{display:'none'}} />
            <button onClick={()=> fileRef.current?.click()} disabled={uploading} style={{width:'100%', padding:'10px', background:'white', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>{uploading ? '업로드 중...' : '📁 파일 추가'}</button>
            {files.length>0 && <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:6}}>{files.map((f,i)=> (<div key={i} style={{display:'flex', alignItems:'center', gap:6, background:'white', border:'1px solid #EEE', borderRadius:8, padding:6}}><div style={{flex:1, fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{f.fileName}</div><button onClick={()=> setFiles(files.filter((_,idx)=> idx!==i))} style={{width:20, height:20, background:'#FFF1F1', border:'1px solid #FFD1D1', borderRadius:10, fontSize:10, cursor:'pointer'}}>✕</button></div>))}</div>}
          </div>

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>급여/연봉</div>
          <input value={form.salary} onChange={e=> setForm({...form, salary: formatSalaryInput(e.target.value)})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>상세 설명</div>
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={4} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', resize:'none', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>연락처</div>
          <input value={form.contact} onChange={e=> setForm({...form, contact: formatPhoneNumber(e.target.value)})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:16, boxSizing:'border-box', background:'white'}} type="tel" maxLength={13} />

          <div style={{display:'flex', gap:8}}>
            <button onClick={()=> router.back()} style={{flex:1, padding:14, background:'white', border:'1px solid #E9ECEF', borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer'}}>취소</button>
            <button onClick={handleUpdate} disabled={saving} style={{flex:2, padding:14, background: saving ? '#ccc' : isJob ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color: isJob ? 'white' : '#1a1a2e', border:'none', borderRadius:12, fontWeight:800, fontSize:13, cursor:'pointer'}}>{saving ? '저장 중...' : '수정 완료'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
