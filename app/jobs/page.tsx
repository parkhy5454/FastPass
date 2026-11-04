
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function JobsPage(){
  const [jobs,setJobs]=useState<any[]>([])
  const [filter,setFilter]=useState('전체')
  const [user,setUser]=useState<any>(null)
  const [selectedJob,setSelectedJob]=useState<any>(null)
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json()).then(d=> setUser(d.user||null)).catch(()=>{})
    fetchJobs()
  },[])

  async function fetchJobs(){
    try{
      const res=await fetch('/api/jobs',{credentials:'include'})
      const data=await res.json()
      setJobs(data.jobs||[])
    }catch{}
  }

  const filtered = filter==='전체' ? jobs : jobs.filter(j=> j.type===filter)

  async function handleDelete(id:string){
    if(!confirm('정말 삭제하시겠습니까?')) return
    try{
      const res=await fetch(`/api/jobs?id=${id}`,{method:'DELETE', credentials:'include'})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error)
      setJobs(jobs.filter(j=> j.id!==id))
      setSelectedJob(null)
      alert('삭제 완료')
    }catch(e:any){ alert(e.message) }
  }

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>취업 게시판</div>
          <button onClick={()=> router.push('/jobs/register')} style={{padding:'8px 14px', background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', color:'#1a1a2e'}}>+ 등록하기</button>
        </div>

        <div style={{display:'flex', gap:8, marginBottom:12}}>
          {['전체','구인','구직'].map(f=>(
            <button key={f} onClick={()=> setFilter(f)} style={{flex:1, padding:'10px', background: filter===f ? '#1a1a2e' : 'white', color: filter===f ? 'white' : '#666', border: filter===f ? 'none' : '1px solid #E9ECEF', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer'}}>{f} {f==='전체' ? `(${jobs.length})` : f==='구인' ? `(${jobs.filter(j=> j.type==='구인').length})` : `(${jobs.filter(j=> j.type==='구직').length})`}</button>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {filtered.map(job=>{
            const isOwner = user && (user.id===job.userId || user.role==='ADMIN' || user.loginId?.includes('parkhy5454'))
            return (
              <div key={job.id} onClick={()=> setSelectedJob(job)} style={{background:'white', borderRadius:16, padding:14, border: isOwner ? '1.5px solid #FFD600' : '1px solid #EEF2F7', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                  <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap'}}>
                    <span style={{padding:'3px 8px', borderRadius:8, fontSize:10, fontWeight:700, background: job.type==='구인' ? '#E8F5E9' : '#FFF9DB', color: job.type==='구인' ? '#2E7D32' : '#8A6D00'}}>{job.type}</span>
                    <span style={{fontSize:11, color:'#888'}}>{job.location} • {job.cert}</span>
                    {job.files && job.files.length>0 && <span style={{fontSize:10, background:'#F0F4FF', color:'#3367D6', padding:'2px 6px', borderRadius:6}}>📎 {job.files.length}</span>}
                    {isOwner && <span style={{fontSize:9, background:'#FFF9DB', color:'#8A6D00', padding:'2px 6px', borderRadius:6, fontWeight:700}}>내 공고</span>}
                  </div>
                  <div style={{fontSize:10, color:'#AAA', whiteSpace:'nowrap'}}>{new Date(job.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{job.title}</div>
                <div style={{fontSize:11, color:'#666'}}>{job.company} • {job.salary}</div>
                {job.description && <div style={{fontSize:11, color:'#888', marginTop:6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{job.description.slice(0,60)}</div>}
                {job.files && job.files.some((f:any)=> f.isImage) && (
                  <div style={{display:'flex', gap:6, marginTop:8, overflowX:'auto'}}>
                    {job.files.filter((f:any)=> f.isImage).slice(0,3).map((f:any, i:number)=>(
                      <img key={i} src={f.url} alt="" style={{width:50, height:50, objectFit:'cover', borderRadius:8, border:'1px solid #EEE'}} />
                    ))}
                    {job.files.filter((f:any)=> f.isImage).length>3 && <div style={{width:50, height:50, background:'#F5F5F5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700}}>+{job.files.filter((f:any)=> f.isImage).length-3}</div>}
                  </div>
                )}
                {isOwner && (
                  <div style={{display:'flex', gap:6, marginTop:10}} onClick={e=> e.stopPropagation()}>
                    <button onClick={()=> router.push(`/jobs/${job.id}/edit`)} style={{flex:1, padding:'8px', background:'#F0F4FF', color:'#3367D6', border:'1px solid #C2D8FF', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>✏️ 수정</button>
                    <button onClick={()=> handleDelete(job.id)} style={{flex:1, padding:'8px', background:'#FFF1F1', color:'#E5484D', border:'1px solid #FFD1D1', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>🗑️ 삭제</button>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length===0 && (
            <div style={{textAlign:'center', padding:40, color:'#888', fontSize:12, background:'white', borderRadius:16, border:'1px solid #EEF2F7'}}>
              등록된 {filter} 공고가 없습니다<br/><button onClick={()=> router.push('/jobs/register')} style={{marginTop:12, padding:'10px 20px', background:'#FFD600', border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer'}}>첫 공고 등록하기</button>
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <div onClick={()=> setSelectedJob(null)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:50, padding:0}}>
          <div onClick={e=> e.stopPropagation()} style={{width:'100%', maxWidth:480, background:'white', borderRadius:'20px 20px 0 0', maxHeight:'85vh', overflowY:'auto', padding:20}}>
            <div style={{width:40, height:4, background:'#E9ECEF', borderRadius:2, margin:'0 auto 16px'}} />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
              <div><div style={{display:'flex', gap:6, marginBottom:8, flexWrap:'wrap'}}><span style={{padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:700, background: selectedJob.type==='구인' ? '#E8F5E9' : '#FFF9DB', color: selectedJob.type==='구인' ? '#2E7D32' : '#8A6D00'}}>{selectedJob.type}</span><span style={{fontSize:11, color:'#888', paddingTop:4}}>{selectedJob.location} • {selectedJob.cert}</span></div><div style={{fontSize:16, fontWeight:800, color:'#1a1a2e'}}>{selectedJob.title}</div><div style={{fontSize:12, color:'#666', marginTop:4}}>{selectedJob.company} • {selectedJob.salary}</div></div>
              <button onClick={()=> setSelectedJob(null)} style={{width:28, height:28, borderRadius:14, background:'#F5F5F5', border:'none', cursor:'pointer'}}>✕</button>
            </div>

            <div style={{background:'#F8F9FA', borderRadius:12, padding:12, marginBottom:12}}>
              <div style={{fontSize:11, color:'#888', marginBottom:4}}>상세 설명</div>
              <div style={{fontSize:12, color:'#333', lineHeight:'1.6', whiteSpace:'pre-wrap'}}>{selectedJob.description||'상세 설명 없음'}</div>
            </div>

            {selectedJob.contact && <div style={{fontSize:12, marginBottom:12}}>📞 연락처: <span style={{fontWeight:700}}>{selectedJob.contact}</span></div>}

            {selectedJob.files && selectedJob.files.length>0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12, fontWeight:800, marginBottom:8}}>📎 첨부 파일 ({selectedJob.files.length}개)</div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {selectedJob.files.map((f:any, i:number)=>(
                    <div key={i} style={{display:'flex', alignItems:'center', gap:10, background:'#F8F9FA', border:'1px solid #E9ECEF', borderRadius:10, padding:10}}>
                      {f.isImage ? <a href={f.url} target="_blank" rel="noopener"><img src={f.url} alt={f.fileName} style={{width:60, height:60, objectFit:'cover', borderRadius:8, border:'1px solid #EEE'}} /></a> : <div style={{width:60, height:60, background: f.isPdf ? '#FFEBEE' : '#E3F2FD', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexDirection:'column'}}><div>{f.isPdf ? '📄' : '📝'}</div><div style={{fontSize:8}}>{(f.ext||'FILE').toUpperCase()}</div></div>}
                      <div style={{flex:1, minWidth:0}}><div style={{fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{f.fileName}</div><div style={{fontSize:10, color:'#888', marginTop:2}}>{(f.fileSize/1024).toFixed(0)}KB</div><div style={{marginTop:4}}><a href={f.url} download={f.fileName} target="_blank" rel="noopener" style={{fontSize:10, background:'white', border:'1px solid #E9ECEF', borderRadius:6, padding:'3px 8px', textDecoration:'none', color:'#3367D6', fontWeight:600}}>{f.isImage ? '원본 보기' : f.isPdf ? 'PDF 열기' : '다운로드'}</a></div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:'flex', gap:8, marginTop:12}}>
              {(user?.id===selectedJob.userId || user?.role==='ADMIN' || user?.loginId?.includes('parkhy5454')) ? (
                <>
                  <button onClick={()=> { setSelectedJob(null); router.push(`/jobs/${selectedJob.id}/edit`) }} style={{flex:1, padding:12, background:'#F0F4FF', color:'#3367D6', border:'1px solid #C2D8FF', borderRadius:10, fontWeight:700, fontSize:12, cursor:'pointer'}}>✏️ 수정</button>
                  <button onClick={()=> handleDelete(selectedJob.id)} style={{flex:1, padding:12, background:'#FFF1F1', color:'#E5484D', border:'1px solid #FFD1D1', borderRadius:10, fontWeight:700, fontSize:12, cursor:'pointer'}}>🗑️ 삭제</button>
                </>
              ) : (
                <a href={`tel:${selectedJob.contact}`} style={{flex:1, padding:12, background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color:'#1a1a2e', border:'none', borderRadius:10, fontWeight:800, fontSize:12, textAlign:'center', textDecoration:'none', display:'block'}}>📞 연락하기</a>
              )}
              <button onClick={()=> setSelectedJob(null)} style={{flex:1, padding:12, background:'white', border:'1px solid #E9ECEF', borderRadius:10, fontWeight:700, fontSize:12, cursor:'pointer'}}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
