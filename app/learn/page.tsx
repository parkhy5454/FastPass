
'use client'
import { useEffect, useState } from 'react'
const FAMILIES: Record<string, string[]> = {
  '전기': ['전기기사','전기공사기사','전기공사산업기사','전기산업기사','전기기능사','전기공사기능사','전기기능장','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','전기철도기술사','전기철도기사','전기철도산업기사','철도신호기사','전기철도기능사'],
  '토목': ['토목기사','토목산업기사','토목시공기술사','토질및기초기술사','도로및공항기술사','상하수도기술사','항만및해안기술사','수자원개발기술사','지적기술사','측량및지형공간정보기사','측량및지형공간정보산업기사','측량및지형공간정보기능사','지적기사','지적산업기사','지적기능사','콘크리트기사','콘크리트산업기사','콘크리트기능사','건설재료시험기사','건설재료시험산업기사','건설재료시험기능사','철도토목기사','철도토목산업기사','토목제도기능사'],
  '정보통신': ['정보통신기사','정보통신산업기사','정보처리기사','정보처리산업기사','정보처리기능사','전자기사','전자산업기사','전자계산기기사','전자계산기제어산업기사','무선설비기사','방송통신기사','정보통신기술사','전자응용기술사','통신설비기능장'],
  '기계': ['기계기사','기계설계기사','공조냉동기계기사','에너지관리기사','가스기사','용접기사','기계가공기능장','기계정비기능사','공조냉동기계기능사','에너지관리기능사'],
  '건축': ['건축기사','건축산업기사','건축설비기사','건축시공기술사','건축구조기술사'],
  '소방': ['소방설비기사(전기)','소방설비기사(기계)','소방설비산업기사(전기)','소방설비산업기사(기계)','소방시설관리사','소방안전관리자'],
}
export default function LearnPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([])
  const [showOnlyMy, setShowOnlyMy] = useState(true)
  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=> setUser(d.user)).catch(()=>{})
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=> setProblemTypes(Array.isArray(d) && d.length>0 ? d : [{id:'1', name:'기출문제'}, {id:'2', name:'예상문제'}])).catch(()=>{})
  },[])
  const myInterests: string[] = user?.interests || []
  function getFamily(name:string): string { for(const [fam, list] of Object.entries(FAMILIES)){ if((list as string[]).includes(name) || name.includes(fam)) return fam } return '기타' }
  const myFamilies: string[] = Array.from(new Set(myInterests.map((n:string)=>getFamily(n)))) as string[]
  let displayQuals: string[] = []
  if(myInterests.length>0 && showOnlyMy){ for(const fam of myFamilies){ const list = (FAMILIES as any)[fam] as string[] | undefined; if(list) displayQuals.push(...list) } displayQuals = Array.from(new Set([...myInterests, ...displayQuals])) } else if(myInterests.length>0){ displayQuals = myInterests } else { displayQuals = FAMILIES['전기'] }
  displayQuals = Array.from(new Set(displayQuals))
  return (<main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}><h1 style={{fontSize:'20px', fontWeight:800}}>📚 내 학습 - {myFamilies[0] || '전체'} {displayQuals.length}개</h1><div style={{background:'white', padding:'14px', borderRadius:'12px', marginTop:'12px'}}>{user ? <><div style={{fontWeight:800}}>👤 {user.name}님 - 관심: {myFamilies.join(', ')} ({myInterests.length}개)</div><div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'8px'}}>{myInterests.map((i:string)=><span key={i} style={{background:'#FFD60A', padding:'6px 12px', borderRadius:'20px', fontWeight:700}}>{i}</span>)}</div></> : <div>로그인 필요</div>}</div><div style={{marginTop:'16px'}}>{displayQuals.map((name:string)=>{ const books = flipbooks.filter((f:any)=> f.category===name); const isMy = myInterests.includes(name); return (<div key={name} style={{background: isMy ? '#FFFBEB' : 'white', borderRadius:'16px', padding:'16px', marginBottom:'10px', border: isMy ? '2px solid #FFD60A' : '1px solid #E5E7EB'}}><div style={{display:'flex', justifyContent:'space-between'}}><div><div style={{fontWeight:800}}>{name} {isMy && <span style={{background:'#FFD60A', fontSize:'10px', padding:'3px 8px', borderRadius:'6px'}}>내 관심</span>}</div><div style={{fontSize:'11px', color:'#6B7280', marginTop:'4px'}}>{getFamily(name)} - {books.length}개 PDF</div></div><div style={{width:'48px', height:'48px', background: isMy ? '#FFD60A' : '#F3F4F6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>📘</div></div></div>)})}</div></main>)
}
