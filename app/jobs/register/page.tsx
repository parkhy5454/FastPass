
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUALIFICATIONS = ['전기기사','전기산업기사','토목기사','건축기사','정보처리기사','기계기사','전기공사기사','소방설비기사','건축전기설비기사','정보통신기사']

export default function JobRegisterPage(){
  const [user,setUser]=useState<any>(null)
  const [type,setType]=useState<'구인'|'구직'>('구인')
  const [form,setForm]=useState({title:'', company:'', location:'서울', salary:'', cert:'전기기사', description:'', contact:''})
  const [loading,setLoading]=useState(false)
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
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
        body: JSON.stringify({type, ...form})
      })
      const data=await res.json()
      if(!res.ok) throw new Error(data.error||'등록 실패')
      alert(`${type} 등록 완료!`)
      router.push('/jobs')
    }catch(e:any){
      alert(e.message)
    }finally{ setLoading(false) }
  }

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:16}}>
          <button onClick={()=>router.back()} style={{width:32, height:32, borderRadius:16, background:'white', border:'1px solid #E9ECEF', cursor:'pointer'}}>←</button>
          <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>구인/구직 등록</div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:10}}>구인/구직 선택</div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={()=>setType('구인')} style={{flex:1, padding:'14px', background: type==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'white', color: type==='구인' ? 'white' : '#888', border: type==='구인' ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: type==='구인' ? 800 : 600, cursor:'pointer', boxShadow: type==='구인' ? '0 4px 12px rgba(52,168,83,0.3)' : 'none'}}>🏢 구인 (사람 구해요)</button>
            <button onClick={()=>setType('구직')} style={{flex:1, padding:'14px', background: type==='구직' ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: type==='구직' ? '#1a1a2e' : '#888', border: type==='구직' ? 'none' : '1.5px solid #E9ECEF', borderRadius:12, fontSize:13, fontWeight: type==='구직' ? 800 : 600, cursor:'pointer', boxShadow: type==='구직' ? '0 4px 12px rgba(255,214,0,0.3)' : 'none'}}>👤 구직 (일 구해요)</button>
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>제목 *</div>
          <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder={type==='구인' ? '예: 전기기사 구인 - 삼성전기' : '예: 전기기사 구직 - 경력 5년'} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>{type==='구인' ? '회사명 *' : '이름/회사 *'}</div>
          <input value={form.company} onChange={e=>setForm({...form, company:e.target.value})} placeholder={type==='구인' ? '예: 삼성전기' : '예: 홍길동 또는 개인'} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12}}>
            <div>
              <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>지역</div>
              <select value={form.location} onChange={e=>setForm({...form, location:e.target.value})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white'}}>
                <option>서울</option><option>부산</option><option>인천</option><option>경기</option><option>대구</option><option>대전</option><option>광주</option><option>울산</option><option>세종</option><option>강원</option><option>충북</option><option>충남</option><option>전북</option><option>전남</option><option>경북</option><option>경남</option><option>제주</option>
              </select>
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>자격증</div>
              <select value={form.cert} onChange={e=>setForm({...form, cert:e.target.value})} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, background:'white'}}>
                {QUALIFICATIONS.map(q=> <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
          </div>

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>급여/연봉</div>
          <input value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} placeholder={type==='구인' ? '예: 4000만원~' : '예: 협의 또는 희망 연봉'} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>상세 설명</div>
          <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder={type==='구인' ? '자격 요건, 우대 사항, 복리후생 등을 적어주세요' : '경력, 보유 자격증, 자기소개 등을 적어주세요'} rows={4} style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:12, boxSizing:'border-box', resize:'none', background:'white'}} />

          <div style={{fontSize:11, fontWeight:700, marginBottom:6}}>연락처</div>
          <input value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} placeholder="예: 010-1234-5678 또는 이메일" style={{width:'100%', padding:'12px', border:'1px solid #E9ECEF', borderRadius:10, fontSize:12, marginBottom:16, boxSizing:'border-box', background:'white'}} />

          <button onClick={handleSubmit} disabled={loading} style={{width:'100%', padding:14, background: loading ? '#ccc' : type==='구인' ? 'linear-gradient(135deg, #34A853 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', color: type==='구인' || loading ? 'white' : '#1a1a2e', border:'none', borderRadius:12, fontWeight:800, fontSize:13, cursor:'pointer', boxShadow: loading ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'}}>{loading ? '등록 중...' : `${type} 등록하기`}</button>

          <div style={{fontSize:10, color:'#888', textAlign:'center', marginTop:10}}>등록 후 취업 탭에서 확인 가능 • 본인 글만 삭제 가능</div>
        </div>
      </div>
    </div>
  )
}
