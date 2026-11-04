
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type JobType = '전체'|'구인'|'구직'

export default function JobsPage(){
  const [user,setUser]=useState<any>(null)
  const [jobType,setJobType]=useState<JobType>('전체')
  const [jobs,setJobs]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(()=>{})
    loadJobs()
  },[])

  function loadJobs(type: JobType = '전체'){
    setLoading(true)
    fetch(`/api/jobs?type=${type==='전체' ? '' : type}`)
      .then(r=>r.json()).then(d=>{
        if(d.jobs) setJobs(d.jobs)
      }).catch(()=>{}).finally(()=> setLoading(false))
  }

  useEffect(()=>{ loadJobs(jobType) },[jobType])

  async function handleDelete(id:string){
    if(!confirm('이 공고를 삭제하시겠습니까?')) return
    try{
      const res=await fetch(`/api/jobs?id=${id}`,{method:'DELETE'})
      const data=await res.json()
      if(!res.ok) throw new Error(data.error)
      alert('삭제 완료')
      loadJobs(jobType)
    }catch(e:any){ alert(e.message) }
  }

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e'}}>취업하기 💼</div>
          <button onClick={()=>router.push('/jobs/register')} style={{padding:'8px 14px', background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:20, fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(255,214,0,0.3)'}}>+ 등록하기</button>
        </div>

        <div style={{background:'white', borderRadius:16, padding:14, border:'1px solid #EEF2F7', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:10}}>구인 / 구직</div>
          <div style={{display:'flex', gap:8}}>
            {(['전체','구인','구직'] as JobType[]).map(t=>(
              <button key={t} onClick={()=>setJobType(t)} style={{flex:1, padding:'12px', background: jobType===t ? (t==='전체' ? 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)' : t==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)') : 'white', color: jobType===t ? (t==='구직' ? '#1a1a2e' : 'white') : '#888', border: jobType===t ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: jobType===t ? 800 : 600, cursor:'pointer', boxShadow: jobType===t ? '0 4px 12px rgba(0,0,0,0.15)' : 'none', display:'flex', alignItems:'center', justifyContent:'center', gap:4}}>
                {t==='전체' ? '📋' : t==='구인' ? '🏢' : '👤'} {t} {t!=='전체' && `(${jobs.filter(j=>j.type===t).length})`}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {loading ? <div style={{textAlign:'center', padding:40, background:'white', borderRadius:16, color:'#888'}}>로딩중...</div> :
            jobs.length===0 ? <div style={{textAlign:'center', padding:40, background:'white', borderRadius:16, color:'#888', fontSize:12}}><div style={{fontSize:24, marginBottom:8}}>📭</div>공고가 없습니다<br/><button onClick={()=>router.push('/jobs/register')} style={{marginTop:10, padding:'8px 16px', background:'#FFD600', border:'none', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer'}}>첫 공고 등록하기</button></div> :
            jobs.map((job:any)=>(
              <div key={job.id} style={{background:'white', borderRadius:14, padding:14, border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
                  <span style={{padding:'4px 8px', background: job.type==='구인' ? '#E8F5E9' : '#FFF9DB', color: job.type==='구인' ? '#2E7D32' : '#8B6914', borderRadius:6, fontSize:10, fontWeight:700}}>{job.type}</span>
                  <div style={{display:'flex', gap:6, alignItems:'center'}}>
                    <span style={{fontSize:10, color:'#888'}}>{job.location} • {job.cert}</span>
                    {(user.role==='ADMIN' || job.userId===user.id || job.userLoginId===user.loginId) && <button onClick={()=>handleDelete(job.id)} style={{padding:'2px 6px', background:'#FFF1F1', color:'#E53E3E', border:'1px solid #FFE0E0', borderRadius:4, fontSize:9, cursor:'pointer'}}>삭제</button>}
                  </div>
                </div>
                <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:4}}>{job.title}</div>
                <div style={{fontSize:11, color:'#666', marginBottom:4, lineHeight:'1.4'}}>{job.description}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
                  <div style={{fontSize:11, color:'#666'}}>{job.company} • {job.salary} {job.contact && `• ${job.contact}`}</div>
                  <button onClick={()=>{ if(job.contact){ window.location.href=`tel:${job.contact}` } else { alert(`${job.company}에 지원하시겠습니까?\n연락처: ${job.contact||'MY 페이지에서 확인'}`) } }} style={{padding:'6px 12px', background: job.type==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color: job.type==='구인' ? 'white' : '#1a1a2e', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>지원하기</button>
                </div>
              </div>
            ))
          }
        </div>

        <button onClick={()=>router.push('/jobs/register')} style={{width:'100%', marginTop:16, padding:14, background:'white', border:'1.5px dashed #FFD600', borderRadius:12, fontSize:12, fontWeight:700, color:'#8B6914', cursor:'pointer'}}>📝 구인/구직 등록하기 (본인 글만 삭제 가능)</button>

        <div style={{background:'linear-gradient(135deg, #FFF9DB 0%, #FFFEF5 100%)', border:'1.5px dashed #FFE066', borderRadius:12, padding:12, marginTop:12, textAlign:'center'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:4}}>💡 자격증으로 취업하세요!</div>
          <div style={{fontSize:11, color:'#666'}}>전기기사 평균 연봉 4000만원~ • 등록하면 취업 탭에 바로 표시!</div>
        </div>
      </div>
    </div>
  )
}
