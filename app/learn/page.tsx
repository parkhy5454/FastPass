
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const FAMILIES = [
  {key:'토목', name:'토목', icon:'🏗️', color:'#4285F4'},
  {key:'건축', name:'건축', icon:'🏢', color:'#34A853'},
  {key:'기계', name:'기계', icon:'⚙️', color:'#FB8C00'},
  {key:'전기', name:'전기', icon:'⚡', color:'#FFD600'},
  {key:'정보통신', name:'정보통신', icon:'💻', color:'#7C4DFF'},
]

const QUALIFICATION_FAMILIES: Record<string, string[]> = {
  '토목': ['토목기사','토목산업기사','측량및지형공간정보기사','건설재료시험기사','콘크리트기사','철도토목기사','지적기사','도시계획기사','조경기사','항공측량기사','토목시공기술사','토목구조기술사','도로및공항기술사','상하수도기술사','측량및지형공간정보기술사','도시계획기술사','조경기술사','항만및해안기술사','지적기술사','건설재료시험기술사','철도기술사','지질및지반기술사','토질및기초기술사','토목품질시험기술사'],
  '건축': ['건축기사','건축산업기사','실내건축기사','건축설비기사','건축시공기술사','건축구조기술사','건축기계설비기술사','건축전기설비기술사','건축품질시험기술사','건설안전기술사'],
  '기계': ['기계기사','기계산업기사','기계설계기사','공조냉동기계기사','용접기사','금형기사','기계가공조립기사','농업기계기사','조선기사','항공기사','기계제작기술사','공조냉동기계기술사','용접기술사','금형기술사','조선기술사','항공기술사','기계안전기술사','공장관리기술사','산업기계설비기술사','건설기계기술사'],
  '전기': ['전기기사','전기산업기사','전기공사기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기술사','전기철도기술사','소방설비기사','전기공사기술사','건축전기설비기사','정보통신기사','전기기능사','전기공사기능사','철도전기신호기능사'],
  '정보통신': ['정보통신기사','정보처리기사','전자기사','정보통신산업기사','정보처리산업기사','전자산업기사','무선설비기사','방송통신기사','전파전자통신기사','정보보안기사','멀티미디어콘텐츠제작전문가','정보통신기술사','전자응용기술사','정보관리기술사','컴퓨터시스템응용기술사','전자계산기기술사','정보통신기술사','방송통신기술사','무선설비기술사','전파전자통신기술사','정보보안기술사'],
}

const QUALIFICATIONS = ['전기기사','전기산업기사','전기공사기사','전기공사산업기사','토목기사','토목산업기사','건축기사','건축산업기사','건축전기설비기술사','발송배전기술사','건축전기설비기사','정보통신기사','소방설비기사','기계기사','정보처리기사','측량및지형공간정보기사','실내건축기사','공조냉동기계기사','건설안전기사','산업안전기사']

export default function LearnPage(){
  const [user,setUser]=useState<any>(null)
  const [interest,setInterest]=useState<string>('')
  const [selectedCert,setSelectedCert]=useState<string>('전기기사')
  const [selectedType,setSelectedType]=useState<string>('전체')
  const [types,setTypes]=useState<any[]>([{id:'default-1', name:'기출문제', category:'전기기사', count:0},{id:'default-2', name:'예상문제', category:'전기기사', count:0}])
  const [problems,setProblems]=useState<any[]>([])
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
      setInterest(d.user.interest||'전기기사')
      setSelectedCert(d.user.interest||'전기기사')
    }).catch(()=>{})
    loadTypes()
  },[])

  useEffect(()=>{
    if(selectedCert){
      loadTypes()
      loadProblems()
    }
  },[selectedCert, selectedType])

  function loadTypes(){
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(d.types){
        const filtered = d.types.filter((t:any)=> t.category===selectedCert)
        const defaults = [{id:'default-1', name:'기출문제', category:selectedCert, count:0},{id:'default-2', name:'예상문제', category:selectedCert, count:0}]
        const all = [...defaults]
        filtered.forEach((t:any)=>{ if(!all.find(a=> a.name===t.name)) all.push(t) })
        setTypes(all)
      }
    }).catch(()=>{
      try{
        const saved=JSON.parse(localStorage.getItem('problemTypes')||'[]')
        const filtered = saved.filter((t:any)=> t.category===selectedCert)
        const defaults = [{id:'default-1', name:'기출문제', category:selectedCert, count:0},{id:'default-2', name:'예상문제', category:selectedCert, count:0}]
        const all=[...defaults, ...filtered]
        setTypes(all)
      }catch{}
    })
    window.addEventListener('problemTypesUpdated', ()=>{
      try{
        const saved=JSON.parse(localStorage.getItem('problemTypes')||'[]')
        const filtered = saved.filter((t:any)=> t.category===selectedCert)
        const defaults = [{id:'default-1', name:'기출문제', category:selectedCert, count:0},{id:'default-2', name:'예상문제', category:selectedCert, count:0}]
        setTypes([...defaults, ...filtered])
      }catch{}
    })
  }

  function loadProblems(){
    fetch(`/api/admin/flipbooks?category=${encodeURIComponent(selectedCert)}`).then(r=>r.json()).then(d=>{
      if(d.flipbooks){
        let filtered = d.flipbooks
        if(selectedType!=='전체') filtered = filtered.filter((f:any)=> f.type===selectedType)
        setProblems(filtered)
        setTypes(prev=> prev.map(t=> ({...t, count: d.flipbooks.filter((f:any)=> f.category===selectedCert && (f.type===t.name || (t.id.startsWith('default-') && (f.type===t.name)))).length })))
      }
    }).catch(()=>{})
  }

  function getFamilyForCert(cert:string){
    for(const [fam, certs] of Object.entries(QUALIFICATION_FAMILIES)){
      if((certs as string[]).includes(cert)) return fam
    }
    return '전기'
  }

  const currentFamily = getFamilyForCert(interest || selectedCert)
  const familyCerts = QUALIFICATION_FAMILIES[currentFamily] || QUALIFICATIONS

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh'}}>로딩중...</div>

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e', marginBottom:12}}>학습하기 📚</div>

        <div style={{background:'white', borderRadius:16, padding:14, border:'1px solid #EEF2F7', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>내 관심 분야: <span style={{color:'#4285F4'}}>{interest}</span> ({currentFamily} - {familyCerts.length}개)</div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {FAMILIES.map(f=>(
              <button key={f.key} onClick={()=>{ setInterest(f.key); const first = QUALIFICATION_FAMILIES[f.key]?.[0] || QUALIFICATIONS[0]; setSelectedCert(first) }} style={{padding:'6px 12px', background: currentFamily===f.key ? `linear-gradient(135deg, ${f.color} 0%, ${f.color}DD 100%)` : 'white', color: currentFamily===f.key ? (f.key==='전기' ? '#1a1a2e' : 'white') : '#888', border: currentFamily===f.key ? 'none' : '1px solid #EEF2F7', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', boxShadow: currentFamily===f.key ? `0 2px 8px ${f.color}40` : 'none'}}>{f.icon} {f.name}</button>
            ))}
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:14, border:'1px solid #EEF2F7', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>자격증 선택 ({familyCerts.length}개)</div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap', maxHeight:120, overflowY:'auto'}}>
            {familyCerts.map(cert=>(
              <button key={cert} onClick={()=>setSelectedCert(cert)} style={{padding:'8px 12px', background: selectedCert===cert ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: selectedCert===cert ? '#1a1a2e' : '#666', border: selectedCert===cert ? '2.5px solid #FFB800' : '1.5px solid #BFDBFE', borderRadius:10, fontSize:11, fontWeight: selectedCert===cert ? 800 : 500, cursor:'pointer', boxShadow: selectedCert===cert ? '0 3px 10px rgba(255,214,0,0.35)' : 'none'}}>{cert}</button>
            ))}
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:14, border:'1px solid #EEF2F7', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>문제 유형</div>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            <button onClick={()=>setSelectedType('전체')} style={{padding:'8px 14px', background: selectedType==='전체' ? 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)' : 'white', color: selectedType==='전체' ? 'white' : '#666', border: selectedType==='전체' ? 'none' : '1px solid #E9ECEF', borderRadius:20, fontSize:11, fontWeight: selectedType==='전체' ? 700 : 500, cursor:'pointer', boxShadow: selectedType==='전체' ? '0 2px 8px rgba(66,133,244,0.3)' : 'none'}}>전체 ({types.reduce((a,b)=>a+b.count,0)})</button>
            {types.map(t=>(
              <button key={t.id} onClick={()=>setSelectedType(t.name)} style={{padding:'8px 14px', background: selectedType===t.name ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: selectedType===t.name ? '#1a1a2e' : '#666', border: selectedType===t.name ? '2px solid #FFB800' : '1px solid #FFE066', borderRadius:20, fontSize:11, fontWeight: selectedType===t.name ? 700 : 500, cursor:'pointer', boxShadow: selectedType===t.name ? '0 2px 8px rgba(255,214,0,0.3)' : 'none', display:'flex', gap:4, alignItems:'center'}}>{t.name.includes('기출') ? '📄' : '⭐'} {t.name} ({t.count||0})</button>
            ))}
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:14, border:'1px solid #EEF2F7', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>{selectedCert} - {selectedType} 문제 ({problems.length})</div>
          {problems.length===0 ? <div style={{textAlign:'center', padding:24, color:'#888', fontSize:12, background:'#F8F9FA', borderRadius:10}}>문제가 없습니다<br/><span style={{fontSize:11}}>MY → PDF에서 업로드하세요</span></div> :
            problems.map((p:any)=>(
              <div key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'#F8F9FA', borderRadius:10, marginBottom:6}}>
                <div><div style={{fontSize:12, fontWeight:600}}>{p.title}</div><div style={{fontSize:10, color:'#888'}}>{p.category} • {p.type} • {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}</div></div>
                <button onClick={()=> window.open(`/flipbook/${p.id}`, '_blank')} style={{padding:'6px 12px', background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', border:'none', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer'}}>보기</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
