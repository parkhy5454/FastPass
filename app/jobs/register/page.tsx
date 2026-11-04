
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ALL_QUALIFICATIONS = {
  '전기 (17개)': ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사'],
  '토목 (6개)': ['토목기사','토목산업기사','측량및지형공간정보기사','건설안전기사','토목시공기술사','토질및기초기술사'],
  '건축 (2개)': ['건축기사','건축산업기사'],
  '기계 (3개)': ['기계기사','기계설계기사','일반기계기사'],
  '정보통신 (2개)': ['정보처리기사','정보통신기사'],
  '기타': ['소방설비기사','위험물산업기사','산업안전기사','건축설비기사','조경기사','에너지관리기사']
}

export default function JobRegisterPage(){
  const [user,setUser]=useState<any>(null)
  const [type,setType]=useState<'구인'|'구직'>('구인')
  const [form,setForm]=useState({title:'', company:'', location:'서울', salary:'', cert:'전기기사', description:'', contact:''})
  const [loading,setLoading]=useState(false)
  const [showCertList,setShowCertList]=useState(false)
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me', {credentials:'include'}).then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
      setForm(f=> ({...f, company: d.user.name||d.user.loginId||''}))
    }).catch(()=> router.push('/login'))
  },[])

  async function handleSubmit(){
    if(!form.title.trim()) return alert('제목을 입력하세요')
    if(!form.company.trim()) return alert('회사/이름을 입력하세요')
    setLoading(true)
    try{
      const res=await fetch('/api/jobs',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({type, ...form, paid:true, paidAmount:0, paymentId:'test-skip'})
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'등록 실패')
      alert(`${type} 등록 완료! (결제 스킵 테스트)`)
      router.push('/jobs')
    }catch(e:any){ alert(e.message) }finally{ setLoading(false) }
  }

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <button onClick={()=>router.back()} style={{width:32, height:32, borderRadius:16, background:'white', border:'1px solid #E9ECEF', cursor:'pointer'}}>←</button>
          <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>구인/구직 등록 (결제 스킵)</div>
        </div>

        <div style={{background:'#FFF3CD', border:'1px solid #FFE69C', borderRadius:12, padding:10, marginBottom:12, fontSize:11, color:'#856404'}}>
          ⚠️ 테스트 모드: 결제를 건너뛰고 바로 등록 가능합니다
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:10}}>구인/구직 선택</div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=>setType('구인')} style={{flex:1, padding:'14px', background: type==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'white', color: type==='구인' ? 'white' : '#888', border: type==='구인' ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: type==='구인' ? 800 : 600, cursor:'pointer'}}>🏢 구인</button>
            <button onClick={()=>setType('구직')} style={{flex:1, padding:'14px', background: type==='구직' ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: type==='구직' ? '#1a1a2e' : '#888', border: type==='구직' ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: type==='구직' ? 800 : 600, cursor:'pointer'}}>👤 구직</button>
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>제목 *</div>
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder={type==='구인' ? '예: 전기기사 구인 - 삼성전기' : '예: 전기기사 구직 - 경력 5년'} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>{type==='구인' ? '회사명 *' : '이름/회사 *'}</div>
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

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>급여/연봉</div>
          <input value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} placeholder="예: 4000만원~" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>상세 설명</div>
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="자격 요건, 우대 사항" rows={4} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', resize:'none', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>연락처</div>
          <input value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} placeholder="010-1234-5678" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:16, boxSizing:'border-box', background:'white'}} />

          <button onClick={handleSubmit} disabled={loading} style={{width:'100%', padding:14, background: loading ? '#ccc' : type==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color: type==='구인' || loading ? 'white' : '#1a1a2e', border:'none', borderRadius:12, fontWeight:800, fontSize:13, cursor:'pointer'}}>{loading ? '등록 중...' : `${type} 등록하기 (결제 스킵)`}</button>
        </div>
      </div>
    </div>
  )
}
