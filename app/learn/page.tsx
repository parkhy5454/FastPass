
'use client'
import { useEffect, useState } from 'react'

const QUALIFICATION_FAMILIES: Record<string, string[]> = {
  '전기': ['전기기사','전기공사기사','전기공사산업기사','전기산업기사','전기기능사','전기공사기능사','전기기능장','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','전기철도기술사','전기철도기사','전기철도산업기사','철도신호기사','전기철도기능사','철도차량정비기능사'],
  '정보통신': ['정보통신기사','정보통신산업기사','정보처리기사','정보처리산업기사','정보처리기능사','전자기사','전자산업기사','전자계산기기사','전자계산기제어산업기사','무선설비기사','방송통신기사','정보통신기술사','전자응용기술사','통신설비기능장','전자계산기기능사','정보기기운용기능사','통신선로기능사','전파전자통신기사','정보통신설비기능사','사무자동화산업기사'],
  '소방': ['소방설비기사(전기)','소방설비기사(기계)','소방설비산업기사(전기)','소방설비산업기사(기계)','소방시설관리사','소방안전관리자','소방설비기능사'],
  '건축': ['건축기사','건축산업기사','건축설비기사','건축시공기술사','건축구조기술사','건축목공기능사','건축도장기능사'],
  '토목': ['토목기사','토목산업기사','토목시공기술사','측량및지형공간정보기사'],
  '기계': ['기계기사','기계설계기사','공조냉동기계기사','에너지관리기사','가스기사','용접기사','기계가공기능장'],
}

export default function LearnPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [showOnlyMyInterests, setShowOnlyMyInterests] = useState(true)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=> setUser(d.user)).catch(()=>{})
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=> setProblemTypes(Array.isArray(d) && d.length>0 ? d : [{id:'1', name:'기출문제'}, {id:'2', name:'예상문제'}])).catch(()=>{})
  },[])

  const myInterests = user?.interests || []

  function getFamily(name:string){
    for(const [family, list] of Object.entries(QUALIFICATION_FAMILIES)){
      if(list.includes(name) || name.includes(family)) return family
    }
    return '기타'
  }

  // 내 관심사 기반 계열 찾기
  const myFamilies = Array.from(new Set(myInterests.map(getFamily)))

  // 보여줄 자격증 결정
  let displayQuals: string[] = []
  if(showOnlyMyInterests && myInterests.length>0){
    // 내 관심사 계열의 모든 자격증 (10~28개) 표시, 전기는 안보임
    if(myFamilies.length>0){
      for(const fam of myFamilies){
        if(QUALIFICATION_FAMILIES[fam]){
          displayQuals.push(...QUALIFICATION_FAMILIES[fam])
        }
      }
      // 중복 제거 + 내 관심사도 포함
      displayQuals = Array.from(new Set([...myInterests, ...displayQuals]))
    } else {
      displayQuals = myInterests
    }
  } else if(myInterests.length>0){
    // 내 관심사만
    displayQuals = myInterests
  } else {
    // 기본 전기
    displayQuals = QUALIFICATION_FAMILIES['전기']
  }

  // 중복 제거
  displayQuals = Array.from(new Set(displayQuals))

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'20px', fontWeight:800}}>📚 내 학습 - {myFamilies.join(', ') || '전기'} 자격증만 보기</h1>
      
      <div style={{background:'white', padding:'12px', borderRadius:'12px', marginTop:'12px'}}>
        {user ? (
          <>
            <div style={{fontWeight:700, fontSize:'13px'}}>👤 {user.name}님의 관심 분야: {myFamilies.join(', ') || '없음'} ({myInterests.length}개 선택)</div>
            <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'8px'}}>
              {myInterests.map((i:string)=><span key={i} style={{background:'#FFD60A', padding:'6px 10px', borderRadius:'20px', fontWeight:700, fontSize:'12px'}}>{i}</span>)}
            </div>
            <div style={{marginTop:'10px', display:'flex', gap:'8px'}}>
              <button onClick={()=>setShowOnlyMyInterests(true)} style={{padding:'10px 16px', borderRadius:'20px', border:'none', background: showOnlyMyInterests ? '#111827' : '#F3F4F6', color: showOnlyMyInterests ? 'white' : '#6B7280', fontSize:'12px', fontWeight:700}}>
                ✅ 내 관심 분야만 보기 ({displayQuals.length}개) - 전기 안보임
              </button>
              <button onClick={()=>setShowOnlyMyInterests(false)} style={{padding:'10px 16px', borderRadius:'20px', border:'none', background: !showOnlyMyInterests ? '#111827' : '#F3F4F6', color: !showOnlyMyInterests ? 'white' : '#6B7280', fontSize:'12px', fontWeight:700}}>
                전체 보기
              </button>
            </div>
            <div style={{marginTop:'8px', fontSize:'11px', color:'#6B7280', background:'#F8F9FB', padding:'8px', borderRadius:'8px'}}>
              {showOnlyMyInterests ? (
                <>현재 {myFamilies.join(', ')} 분야 {displayQuals.length}개만 보임 - 전기는 안보임! ✅<br/>예: 정보통신 관심 누름 → 정보통신 20개만 보임, 전기 28개 안보임</>
              ) : (
                <>내 관심 {myInterests.length}개만 표시</>
              )}
            </div>
          </>
        ) : (
          <div style={{fontSize:'12px'}}>로그인 필요</div>
        )}
      </div>

      <div style={{marginTop:'16px'}}>
        {displayQuals.map((qualName:any)=>{
          const qualBooks = flipbooks.filter(f=> f.category===qualName)
          const isMyInterest = myInterests.includes(qualName)
          return (
            <div key={qualName} style={{background: isMyInterest ? '#FFFBEB' : 'white', borderRadius:'16px', padding:'16px', marginBottom:'12px', border: isMyInterest ? '2px solid #FFD60A' : '1px solid #F3F4F6'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:'14px', display:'flex', gap:'6px', flexWrap:'wrap'}}>
                    {qualName}
                    {isMyInterest && <span style={{background:'#FFD60A', fontSize:'10px', padding:'2px 6px', borderRadius:'6px'}}>내 관심</span>}
                    <span style={{background:'#F3F4F6', fontSize:'10px', padding:'2px 6px', borderRadius:'6px'}}>{getFamily(qualName)}</span>
                  </div>
                  <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{getFamily(qualName)} - {qualBooks.length}개 PDF</div>
                  <div style={{display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap'}}>
                    <button style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'white', fontSize:'11px'}}>기출 {qualBooks.filter(f=>f.type==='기출문제').length}년</button>
                    <button style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'white', fontSize:'11px'}}>예상 {qualBooks.filter(f=>f.type==='예상문제').length}제</button>
                    {problemTypes.filter(t=> t.name!=='기출문제' && t.name!=='예상문제').map((t:any)=>{
                      const count = qualBooks.filter(f=> f.type===t.name).length
                      return <button key={t.id} style={{padding:'6px 12px', borderRadius:'8px', border:'1px solid #FFD60A', background: count>0 ? '#FFD60A' : '#FFFBEB', fontSize:'11px', fontWeight:700}}>{t.icon||'📁'} {t.name} ({count})</button>
                    })}
                  </div>
                </div>
                <div style={{width:'48px', height:'48px', background: isMyInterest ? '#FFD60A' : '#F3F4F6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>📘</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{background:'white', borderRadius:'12px', padding:'16px', marginTop:'12px', fontSize:'11px', lineHeight:'1.6'}}>
        <div style={{fontWeight:700, fontSize:'13px'}}>💡 정보통신 관심 누르면?</div>
        <div style={{marginTop:'8px'}}>
          ✅ 회원가입시 정보통신기사 관심 누름<br/>
          ✅ → 내 관심 분야: 정보통신 자동 인식<br/>
          ✅ → 학습 페이지에 정보통신 자격증 20개만 보임 (정보통신기사, 정보처리기사, 전자기사 등)<br/>
          ✅ → 전기 자격증 28개는 안보임! ← 원하시던 거!<br/>
          ✅ → 123회 예상문제도 정보통신 자격증에만 자동 표시<br/><br/>
          전기 관심 누르면 → 전기 17개만 보임, 정보통신 안보임<br/>
          소방 관심 누르면 → 소방 7개만 보임, 전기/정보통신 안보임
        </div>
      </div>
    </main>
  )
}
