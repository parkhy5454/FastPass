
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type JobType = '전체'|'구인'|'구직'

export default function JobsPage(){
  const [user,setUser]=useState<any>(null)
  const [jobType,setJobType]=useState<JobType>('전체')
  const [jobs,setJobs]=useState<any[]>([])
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(()=>{})
    loadJobs()
  },[])

  function loadJobs(){
    // Mock jobs - replace with real API
    setJobs([
      {id:1, type:'구인', title:'전기기사 구인 - 삼성전기', company:'삼성전기', location:'서울', salary:'4000만원~', cert:'전기기사'},
      {id:2, type:'구인', title:'토목기사 현장 소장 모집', company:'현대건설', location:'부산', salary:'5000만원~', cert:'토목기사'},
      {id:3, type:'구직', title:'전기기사 구직 - 경력 5년', company:'개인', location:'서울', salary:'협의', cert:'전기기사'},
      {id:4, type:'구인', title:'건축기사 설계직 모집', company:'대우건설', location:'인천', salary:'4500만원~', cert:'건축기사'},
      {id:5, type:'구직', title:'정보처리기사 구직합니다', company:'개인', location:'경기', salary:'협의', cert:'정보처리기사'},
    ])
  }

  const filtered = jobType==='전체' ? jobs : jobs.filter(j=> j.type===jobType)

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e', marginBottom:12}}>취업하기 💼</div>

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
          {filtered.length===0 ? <div style={{textAlign:'center', padding:40, background:'white', borderRadius:16, color:'#888', fontSize:12}}>공고가 없습니다</div> :
            filtered.map(job=>(
              <div key={job.id} style={{background:'white', borderRadius:14, padding:14, border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
                  <span style={{padding:'4px 8px', background: job.type==='구인' ? '#E8F5E9' : '#FFF9DB', color: job.type==='구인' ? '#2E7D32' : '#8B6914', borderRadius:6, fontSize:10, fontWeight:700}}>{job.type}</span>
                  <span style={{fontSize:10, color:'#888'}}>{job.location} • {job.cert}</span>
                </div>
                <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e', marginBottom:4}}>{job.title}</div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontSize:11, color:'#666'}}>{job.company} • {job.salary}</div>
                  <button style={{padding:'6px 12px', background: job.type==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color: job.type==='구인' ? 'white' : '#1a1a2e', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>지원하기</button>
                </div>
              </div>
            ))
          }
        </div>

        <div style={{background:'linear-gradient(135deg, #FFF9DB 0%, #FFFEF5 100%)', border:'1.5px dashed #FFE066', borderRadius:12, padding:12, marginTop:16, textAlign:'center'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:4}}>💡 자격증으로 취업하세요!</div>
          <div style={{fontSize:11, color:'#666'}}>전기기사 평균 연봉 4000만원~</div>
        </div>
      </div>
    </div>
  )
}
