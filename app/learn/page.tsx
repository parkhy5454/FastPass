
'use client'
import { useEffect, useState } from 'react'

const FAMILIES: Record<string, string[]> = {
  '전기': ['전기기사','전기공사기사','전기공사산업기사','전기산업기사','전기기능사','전기공사기능사','전기기능장','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','전기철도기술사','전기철도기사','전기철도산업기사','철도신호기사','전기철도기능사'],
  '토목': ['토목기사','토목산업기사','토목시공기술사','토질및기초기술사','도로및공항기술사','상하수도기술사','항만및해안기술사','수자원개발기술사','지적기술사','측량및지형공간정보기사','측량및지형공간정보산업기사','측량및지형공간정보기능사','지적기사','지적산업기사','지적기능사','콘크리트기사','콘크리트산업기사','콘크리트기능사','건설재료시험기사','건설재료시험산업기사','건설재료시험기능사','철도토목기사','철도토목산업기사','토목제도기능사'],
  '정보통신': ['정보통신기사','정보통신산업기사','정보처리기사','정보처리산업기사','정보처리기능사','전자기사','전자산업기사','전자계산기기사','전자계산기제어산업기사','무선설비기사','방송통신기사','정보통신기술사','전자응용기술사','통신설비기능장'],
  '기계': ['기계기사','기계설계기사','공조냉동기계기사','에너지관리기사','가스기사','용접기사','기계가공기능장','기계정비기능사'],
  '건축': ['건축기사','건축산업기사','건축설비기사','건축시공기술사','건축구조기술사'],
  '소방': ['소방설비기사(전기)','소방설비기사(기계)','소방설비산업기사(전기)','소방설비산업기사(기계)','소방시설관리사','소방안전관리자'],
}

const CERT_DATA: Record<string, {problems: number, level: string}> = {
  '전기기사': {problems:300, level:'기사'},
  '전기공사기사': {problems:200, level:'기사'},
  '전기철도기사': {problems:200, level:'기사'},
  '철도신호기사': {problems:200, level:'기사'},
  '소방설비기사(전기)': {problems:150, level:'기사'},
}

export default function LearnPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [selectedLevel, setSelectedLevel] = useState('기사')
  const [selectedCert, setSelectedCert] = useState<string | null>('전기기사')
  const [showOnlyMyInterest, setShowOnlyMyInterest] = useState(true)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=> setUser(d.user)).catch(()=>{})
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=> setProblemTypes(Array.isArray(d) && d.length>0 ? d : [{id:'1', name:'기출문제'}, {id:'2', name:'예상문제'}])).catch(()=>{})
  },[])

  const myInterests: string[] = user?.interests || []

  function getFamily(name:string): string {
    for(const [fam, list] of Object.entries(FAMILIES)){
      if((list as string[]).includes(name) || name.includes(fam)) return fam
    }
    return '기타'
  }
  function getLevel(name:string): string {
    if(CERT_DATA[name]) return CERT_DATA[name].level
    if(name.includes('기술사')) return '기술사'
    if(name.includes('기능장')) return '기능장'
    if(name.includes('산업기사')) return '산업기사'
    if(name.includes('기능사')) return '기능사'
    if(name.includes('기사')) return '기사'
    return '기타'
  }

  const myFamilies: string[] = Array.from(new Set(myInterests.map((n:string)=>getFamily(n)))) as string[]

  let allQuals: string[] = []
  if(myInterests.length>0 && showOnlyMyInterest){
    for(const fam of myFamilies){
      const list = (FAMILIES as any)[fam] as string[] | undefined
      if(list) allQuals.push(...list)
    }
    allQuals = Array.from(new Set([...myInterests, ...allQuals]))
  } else if(myInterests.length>0){
    allQuals = myInterests
  } else {
    allQuals = ['전기기사','전기공사기사','전기철도기사','철도신호기사']
  }
  allQuals = Array.from(new Set(allQuals))
  const filteredByLevel = allQuals.filter((q:string)=> getLevel(q)===selectedLevel)

  const levels = ['기술사','기능장','기사','산업기사','기능사']

  return (
    <main style={{paddingBottom:'90px', background:'#F8F9FB', minHeight:'100vh'}}>
      <div style={{background:'white', padding:'20px 20px 16px'}}>
        <h1 style={{fontSize:'20px', fontWeight:800}}>📚 학습</h1>
        <div style={{fontSize:'13px', color:'#6B7280', marginTop:'6px'}}>원하는 자격증 레벨을 선택하세요</div>
        {myInterests.length>0 && (
          <div style={{marginTop:'12px', background:'#FFFBEB', borderRadius:'12px', padding:'10px 12px', border:'1px solid #FDE68A', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontSize:'12px', fontWeight:700}}>👤 내 관심: {myFamilies.join(', ')} ({myInterests.length}개)</div>
            <div style={{display:'flex', gap:'6px'}}>
              <button onClick={()=>setShowOnlyMyInterest(true)} style={{padding:'6px 10px', borderRadius:'20px', border:'none', background: showOnlyMyInterest ? '#111827' : 'white', color: showOnlyMyInterest ? 'white' : '#6B7280', fontSize:'10px', fontWeight:700}}>✅ {allQuals.length}개만</button>
              <button onClick={()=>setShowOnlyMyInterest(false)} style={{padding:'6px 10px', borderRadius:'20px', border:'none', background: !showOnlyMyInterest ? '#111827' : 'white', color: !showOnlyMyInterest ? 'white' : '#6B7280', fontSize:'10px', fontWeight:700}}>내 선택 {myInterests.length}개</button>
            </div>
          </div>
        )}
        <div style={{display:'flex', gap:'8px', marginTop:'16px', overflowX:'auto'}}>
          {levels.map(l=>(
            <button key={l} onClick={()=>setSelectedLevel(l)} style={{padding:'10px 18px', borderRadius:'20px', border:'none', background: selectedLevel===l ? '#111827' : '#F3F4F6', color: selectedLevel===l ? 'white' : '#6B7280', fontSize:'13px', fontWeight:700, whiteSpace:'nowrap'}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:'16px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px'}}>
          <div style={{width:'4px', height:'18px', background:'#2563EB', borderRadius:'2px'}}></div>
          <div style={{fontWeight:800, fontSize:'15px'}}>{selectedLevel} ({filteredByLevel.length}개)</div>
        </div>

        {filteredByLevel.map((certName:string)=>{
          const certBooks = flipbooks.filter((f:any)=> f.category===certName)
          const data = CERT_DATA[certName] || {problems: 200, level: getLevel(certName)}
          const isSelected = selectedCert===certName
          const isHot = certName==='전기기사'

          return (
            <div 
              key={certName} 
              onClick={()=>setSelectedCert(certName)}
              style={{
                background:'white', borderRadius:'16px', padding:'16px', marginBottom:'12px',
                border: isSelected ? '2.5px solid #2563EB' : '1.5px solid #BFDBFE',
                boxShadow: isSelected ? '0 0 0 4px #DBEAFE, 0 4px 12px rgba(37,99,235,0.15)' : '0 1px 3px rgba(37,99,235,0.08)',
                cursor:'pointer',
                transition:'all 0.2s ease',
              }}
            >
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                    <div style={{fontWeight:800, fontSize:'15px', color: isSelected ? '#2563EB' : '#111827'}}>{certName}</div>
                    {isHot && <span style={{background:'#FFD60A', color:'#111827', fontSize:'10px', padding:'3px 8px', borderRadius:'6px', fontWeight:800}}>HOT</span>}
                  </div>
                  <div style={{fontSize:'13px', color:'#6B7280', marginTop:'4px'}}>{data.problems}문제 보유 • {getLevel(certName)}</div>
                  <div style={{display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap'}}>
                    <span style={{background: isSelected ? '#DBEAFE' : '#EFF6FF', color:'#2563EB', fontSize:'11px', padding:'5px 10px', borderRadius:'20px', fontWeight:600, border: isSelected ? '1px solid #BFDBFE' : 'none'}}>기출 10년</span>
                    <span style={{background: isSelected ? '#DBEAFE' : '#EFF6FF', color:'#2563EB', fontSize:'11px', padding:'5px 10px', borderRadius:'20px', fontWeight:600, border: isSelected ? '1px solid #BFDBFE' : 'none'}}>예상문제</span>
                    {problemTypes.filter((t:any)=> t.name!=='기출문제' && t.name!=='예상문제').map((t:any)=>{
                      const count = certBooks.filter((f:any)=> f.type===t.name).length
                      return <span key={t.id} style={{background:'#FFFBEB', border:'1px solid #FDE68A', color:'#92400E', fontSize:'11px', padding:'5px 10px', borderRadius:'20px', fontWeight:700}}>{(t as any).icon||'📁'} {t.name} ({count})</span>
                    })}
                  </div>
                </div>
                <div style={{width:'48px', height:'48px', background: isSelected ? '#DBEAFE' : '#EFF6FF', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginLeft:'12px', border: isSelected ? '1px solid #BFDBFE' : 'none'}}>📘</div>
              </div>
              <div style={{display:'flex', gap:'8px', marginTop:'14px'}}>
                <button style={{flex:1, background: isSelected ? '#1D4ED8' : '#2563EB', color:'white', border:'none', borderRadius:'12px', padding:'12px', fontSize:'13px', fontWeight:700, boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.3)' : 'none'}}>모의고사</button>
                <button style={{flex:1, background: isSelected ? '#DBEAFE' : '#F3F4F6', color: isSelected ? '#1D4ED8' : '#2563EB', border: isSelected ? '1.5px solid #2563EB' : 'none', borderRadius:'12px', padding:'12px', fontSize:'13px', fontWeight:700}}>문제풀기</button>
              </div>
            </div>
          )
        })}

        <div style={{background:'white', borderRadius:'12px', padding:'12px', marginTop:'12px', fontSize:'11px', color:'#6B7280', textAlign:'center', border:'1px solid #BFDBFE'}}>
          💙 안 눌린 카드: 가는 파랑 테두리 (1.5px) / 눌린 카드: 두꺼운 파랑 테두리 (2.5px) + 그림자
        </div>
      </div>
    </main>
  )
}
